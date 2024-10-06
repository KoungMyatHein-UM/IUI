/**
 * Adjusts the counts in allProperties based on bought and liked properties and their weights.
 * @param {Object} allProperties - The collated properties from all products.
 * @param {Object} boughtProperties - The collated properties from bought items.
 * @param {Object} likedProperties - The collated properties from liked items.
 * @param {number} boughtWeight - The weight to apply to bought properties.
 * @param {number} likedWeight - The weight to apply to liked properties.
 * @returns {Object} - The adjusted properties with updated counts.
 */
function adjustFilterablePropertiesCounts(allProperties, boughtProperties, likedProperties, boughtWeight, likedWeight) {
    const adjustedProperties = JSON.parse(JSON.stringify(allProperties)); // Deep copy to avoid mutating original

    // Function to adjust counts for a given property category
    function adjustCountsForCategory(category) {
        const allPropsCategory = adjustedProperties[category];
        const boughtPropsCategory = boughtProperties[category] || {};
        const likedPropsCategory = likedProperties[category] || {};

        for (const prop in allPropsCategory) {
            let adjustment = 0;

            if (boughtPropsCategory[prop]) {
                adjustment += boughtPropsCategory[prop] * boughtWeight;
            }
            if (likedPropsCategory[prop]) {
                adjustment += likedPropsCategory[prop] * likedWeight;
            }

            // Increase the count by the adjustment
            allPropsCategory[prop] += adjustment;
        }
    }

    // Adjust counts for each category
    for (const category in adjustedProperties) {
        adjustCountsForCategory(category);
    }

    return adjustedProperties;
}

/**
 * Collates all filterable properties from the products into a single object with counts.
 * @param {Array} products - The list of products.
 * @returns {Object} - An object containing filterable properties and their counts.
 */
function collateFilterablePropertiesWithCounts(products) {
    const filterableProperties = {};

    // Loop through each product and extract its filterable properties
    products.forEach(product => {
        const props = product.filterable_properties;

        // Count each category, subcategory, product_type, etc.
        addToFilterableProperties(filterableProperties, 'category', props.category);
        addToFilterableProperties(filterableProperties, 'subcategory', props.subcategory);
        addToFilterableProperties(filterableProperties, 'product_type', props.product_type);

        // Count each color
        if (props.colors) {
            props.colors.forEach(color => {
                addToFilterableProperties(filterableProperties, 'colors', color);
            });
        }

        // Count each material
        if (props.materials) {
            props.materials.forEach(material => {
                addToFilterableProperties(filterableProperties, 'materials', material);
            });
        }

        // Count each brand
        if (props.brand) {
            props.brand.forEach(brand => {
                addToFilterableProperties(filterableProperties, 'brand', brand);
            });
        }

        // Count each style
        if (props.styles) {
            props.styles.forEach(style => {
                addToFilterableProperties(filterableProperties, 'styles', style);
            });
        }

        // Count each feature
        if (props.features) {
            props.features.forEach(feature => {
                addToFilterableProperties(filterableProperties, 'features', feature);
            });
        }

        // Count ratings in increments of 1
        if (props.user_rating) {
            const ratingRange = getRatingRange(props.user_rating);
            addToFilterableProperties(filterableProperties, 'user_rating', ratingRange);
        }

        // Count prices in steps of 200
        if (props.price) {
            const priceRange = getPriceRange(props.price);
            addToFilterableProperties(filterableProperties, 'price', priceRange);
        }
    });

    return filterableProperties;
}

/**
 * Adds a property to the filterableProperties object, counting its occurrences.
 * @param {Object} filterableProperties - The object to store property counts.
 * @param {string} key - The property category (e.g., 'colors', 'materials').
 * @param {string|number} value - The value of the property to count.
 */
function addToFilterableProperties(filterableProperties, key, value) {
    if (!filterableProperties[key]) {
        filterableProperties[key] = {}; // Initialize the category if it doesn't exist
    }

    if (value !== undefined) {
        if (!filterableProperties[key][value]) {
            filterableProperties[key][value] = 1; // First time seeing this value
        } else {
            filterableProperties[key][value] += 1; // Increment the count
        }
    }
}

/**
 * Determines the price range for a given price, with increments of 200.
 * @param {number} price - The price of the product.
 * @returns {string} - The price range in which the product falls.
 */
function getPriceRange(price) {
    const min = Math.floor(price / 200) * 200;
    const max = min + 199;
    return `$${min} - $${max}`;
}

/**
 * Determines the rating range for a given rating, with increments of 1.
 * @param {number} rating - The user rating of the product.
 * @returns {string} - The rating range in which the product falls.
 */
function getRatingRange(rating) {
    const min = Math.floor(rating);
    const max = min + 0.99;
    return `${min} - ${max}`;
}

/**
 * Recursively flattens the object and collects all key-value pairs, sorted by value in descending order.
 * @param {Object} obj - The object to flatten.
 * @returns {Array} - Array of key-value pairs as strings, sorted by value in descending order.
 */
function flattenObject(obj) {
    const result = [];

    // Helper function to recursively traverse the object
    function recursiveFlatten(subObj) {
        for (const key in subObj) {
            if (typeof subObj[key] === 'object' && !Array.isArray(subObj[key])) {
                // If the value is an object, recurse into it
                recursiveFlatten(subObj[key]);
            } else {
                // Otherwise, add the key-value pair to the result array
                result.push({ key: `${key}`, value: subObj[key] });
            }
        }
    }

    // Start the recursive flattening
    recursiveFlatten(obj);

    // Sort by the 'value' property in descending order
    result.sort((a, b) => b.value - a.value);

    // Return the array in "key: value" format as strings
    return result.map(item => `${item.key}: ${item.value}`);
}

/**
 * Function to capitalize the first letter of each word in a string.
 * @param {string} str - The input string to be capitalized.
 * @returns {string} - The capitalized string, with the first letter of each word in uppercase.
 */
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Displays the filter keys in the filters-container as individual boxes.
 * @param {Array} keys - Array of filter keys to display.
 */
function displayFilterKeys(keys) {
    const filtersContainer = document.getElementById('filters-container');

    // Clear any existing filters
    filtersContainer.innerHTML = '';

    // Keep track of the original positions of the filter elements
    const originalOrder = [];

    // Retrieve selected filters from local storage
    const selectedFilters = getSelectedFilters();

    // Loop through each key and create a box for it
    keys.forEach((key, index) => {
        const filterBox = document.createElement('div');
        filterBox.classList.add('filter-box-item'); // Add CSS class for styling
        filterBox.textContent = capitalizeWords(key); // Set the text content to the key

        // Save the initial position for later restoration
        originalOrder.push({ element: filterBox, position: index });

        // Check if the filter is in the selectedFilters array
        if (selectedFilters.includes(key)) {
            filterBox.classList.add('active');
            moveActiveToTop(filtersContainer, filterBox);
        }

        // Add click event listener to toggle color on click and move element
        filterBox.addEventListener('click', () => {
            if (filterBox.classList.contains('active')) {
                // If already active, unclick: remove 'active', restore position, and update local storage
                filterBox.classList.remove('active');
                restoreOriginalPosition(filtersContainer, filterBox, originalOrder);
                removeSelectedFilter(key);
            } else {
                // If not active, click: add 'active', move to top, and update local storage
                filterBox.classList.add('active');
                moveActiveToTop(filtersContainer, filterBox);
                addSelectedFilter(key);
            }

            displayProductsAI();
        });

        filtersContainer.appendChild(filterBox); // Append the filter box to the container
    });
}

/**
 * Moves the active filter box to the top of the container, below other active elements.
 * @param {HTMLElement} container - The filters container.
 * @param {HTMLElement} element - The filter box element to move to the top.
 */
function moveActiveToTop(container, element) {
    // Move active filter to the top (before the first non-active filter)
    const activeElements = Array.from(container.children).filter(child => child.classList.contains('active'));
    if (activeElements.length === 0) {
        container.insertBefore(element, container.firstChild);
    } else {
        // Move after the last active element
        const lastActiveElement = activeElements[activeElements.length - 1];
        container.insertBefore(element, lastActiveElement.nextSibling);
    }
}


/**
 * Restores the filter box to its original position based on the originalOrder array.
 * @param {HTMLElement} container - The filters container.
 * @param {HTMLElement} element - The filter box element to restore.
 * @param {Array} originalOrder - The array containing the original positions of all filter elements.
 */
function restoreOriginalPosition(container, element, originalOrder) {
    const original = originalOrder.find(item => item.element === element);
    if (original) {
        container.removeChild(element);

        // Find the correct position to re-insert the element
        const activeElements = Array.from(container.children).filter(child => child.classList.contains('active'));
        const indexAfterActive = activeElements.length;

        container.insertBefore(element, container.children[original.position + indexAfterActive] || null);
    }
}



/**
 * Calculates scores for each filter based on counts from all, bought, and liked products.
 * @param {Object} allProperties - Collated properties from all products.
 * @param {Object} boughtProperties - Collated properties from bought products.
 * @param {Object} likedProperties - Collated properties from liked products.
 * @returns {Array} - Array of filters with their calculated scores, sorted in descending order.
 */
function calculateFilterScores(allProperties, boughtProperties, likedProperties) {
    const filterScores = [];

    // Define weighting factors
    const boughtWeight = 20; // Higher influence
    const likedWeight = 1;  // Lower influence

    // Collect all unique filters across all categories
    const allFilters = {};

    // Function to collect filters from a property object
    function collectFilters(propertyObj) {
        for (const category in propertyObj) {
            if (propertyObj.hasOwnProperty(category)) {
                if (!allFilters[category]) {
                    allFilters[category] = {};
                }
                for (const filter in propertyObj[category]) {
                    if (propertyObj[category].hasOwnProperty(filter)) {
                        allFilters[category][filter] = true;
                    }
                }
            }
        }
    }

    // Collect filters from all properties
    collectFilters(allProperties);
    collectFilters(boughtProperties);
    collectFilters(likedProperties);

    // Calculate scores for each filter
    for (const category in allFilters) {
        if (allFilters.hasOwnProperty(category)) {
            for (const filter in allFilters[category]) {
                if (allFilters[category].hasOwnProperty(filter)) {
                    const allCount = (allProperties[category][filter] || 0);
                    const boughtCount = (boughtProperties[category] && boughtProperties[category][filter]) || 0;
                    const likedCount = (likedProperties[category] && likedProperties[category][filter]) || 0;

                    // Calculate the score with weights
                    const score = allCount + (boughtWeight * boughtCount) + (likedWeight * likedCount);

                    // Store the filter with its score
                    filterScores.push({
                        key: filter,
                        category: category,
                        score: score
                    });
                }
            }
        }
    }

    // Sort the filters by score in descending order
    filterScores.sort((a, b) => b.score - a.score);

    return filterScores;
}




/**
 * Main function to fetch products and display filters based on calculated scores.
 */
async function main() {
    try {
        const response = await fetch('products.json'); // Fetch the products from the JSON file
        const data = await response.json();
        const products = data.products;

        // Get bought and liked products
        const boughtList = getBoughtList();
        const likedList = getLikedList();

        const boughtItems = products.filter(product => boughtList.includes(product.product_id));
        const likedItems = products.filter(product => likedList.includes(product.product_id));

        // Collate filterable properties with counts
        const allProperties = collateFilterablePropertiesWithCounts(products);
        const boughtProperties = collateFilterablePropertiesWithCounts(boughtItems);
        const likedProperties = collateFilterablePropertiesWithCounts(likedItems);

        // Calculate scores for filters
        const filterScores = calculateFilterScores(allProperties, boughtProperties, likedProperties);

        // Log the sorted filters and their scores
        console.log(filterScores); // Log the filters with their scores

        // Extract the sorted filter keys
        const sortedFilterKeys = filterScores.map(item => item.key);

        // Display the filters
        displayFilterKeys(sortedFilterKeys);
    } catch (error) {
        console.error('Error fetching the products:', error);
    }
}


// Run the main function
main();
