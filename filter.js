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

        // Count each category, product_type, etc.
        addToFilterableProperties(filterableProperties, 'category', props.category);
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
        if (props.features) {
            props.features.forEach(feature => {
                addToFilterableProperties(filterableProperties, 'features', feature);
            });
        }

        // Count ratings in predefined ranges
        if (props.user_rating) {
            const ratingRange = getRatingRange(props.user_rating);
            addToFilterableProperties(filterableProperties, 'rating', ratingRange);
        }

        // Count prices in predefined ranges
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
 * Determines the price range for a given price, with predefined ranges.
 * @param {number} price - The price of the product.
 * @returns {string} - The price range in which the product falls.
 */
function getPriceRange(price) {
    if (price < 200) return '$0 - $199';
    if (price < 400) return '$200 - $399';
    if (price < 600) return '$400 - $599';
    if (price < 800) return '$600 - $799';
    return '$800 and above';
}

/**
 * Determines the rating range for a given rating, with predefined ranges.
 * @param {number} rating - The user rating of the product.
 * @returns {string} - The rating range in which the product falls.
 */
function getRatingRange(rating) {
    const min = Math.floor(rating);
    return `${min} Stars & Up`;
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
 * Displays the filter keys in the specified container as individual boxes.
 * @param {Array} keys - Array of filter keys to display.
 * @param {string} container_id - The ID of the container where filters will be displayed.
 */
function displayFilterKeys(keys, container_id) {
    const filtersContainer = document.getElementById(container_id);

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

        // Add click event listener to toggle active state and reorder filters
        filterBox.addEventListener('click', () => {
            if (filterBox.classList.contains('active')) {
                // If already active, deactivate and restore position
                filterBox.classList.remove('active');
                restoreOriginalPosition(filtersContainer, filterBox, originalOrder);
                removeSelectedFilter(key);
            } else {
                // If not active, activate and move to top
                filterBox.classList.add('active');
                moveActiveToTop(filtersContainer, filterBox);
                addSelectedFilter(key);
            }

            // displayProductsAI();
            setTimeout(function() {
                location.reload();
            }, 2000);
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
    // Move active filter to the top (after the last active filter)
    const activeElements = Array.from(container.children).filter(child => child.classList.contains('active'));
    if (activeElements.length === 0) {
        container.insertBefore(element, container.firstChild);
    } else {
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
 * Retrieves the selected filters from local storage.
 * @returns {Array} - Array of selected filter keys.
 */
function getSelectedFilters() {
    const selected = localStorage.getItem('selectedFilters');
    return selected ? JSON.parse(selected) : [];
}

/**
 * Adds a filter key to the selected filters in local storage.
 * @param {string} key - The filter key to add.
 */
function addSelectedFilter(key) {
    const selected = getSelectedFilters();
    if (!selected.includes(key)) {
        selected.push(key);
        localStorage.setItem('selectedFilters', JSON.stringify(selected));
    }
}

/**
 * Removes a filter key from the selected filters in local storage.
 * @param {string} key - The filter key to remove.
 */
function removeSelectedFilter(key) {
    let selected = getSelectedFilters();
    selected = selected.filter(item => item !== key);
    localStorage.setItem('selectedFilters', JSON.stringify(selected));
}

/**
 * Placeholder function to display products based on AI or other logic.
 * Replace this with your actual product display logic.
 */
function displayProductsAI() {
    // Implement your product display logic here
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

        // Organize filters by category
        const organizedFilters = {};

        filterScores.forEach(item => {
            if (!organizedFilters[item.category]) {
                organizedFilters[item.category] = [];
            }
            organizedFilters[item.category].push(item.key);
        });

        // Define mapping between categories and their container IDs
        const categoryContainerMap = {
            'category': 'category-container',
            'product_type': 'product-type-container',
            'colors': 'colors-container',
            'materials': 'materials-container',
            'brand': 'brand-container',
            'features': 'features-container',
            'rating': 'rating-container',
            'price': 'price-container'
        };

        console.log(organizedFilters)

        // Iterate through each category and display its filters
        for (const category in organizedFilters) {
            if (organizedFilters.hasOwnProperty(category) && categoryContainerMap[category]) {
                displayFilterKeys(organizedFilters[category], categoryContainerMap[category]);
            }
        }

        // Handle pre-defined Price and Rating filters separately if needed
        // For example, you can directly set them if they are static
        // Or ensure they are populated based on the filterScores
    } catch (error) {
        console.error('Error fetching the products:', error);
    }
}

/**
 * Placeholder function to get the list of bought product IDs.
 * Replace this with your actual implementation.
 * @returns {Array} - Array of bought product IDs.
 */
function getBoughtList() {
    // Implement your logic to retrieve bought product IDs
    return [];
}

/**
 * Placeholder function to get the list of liked product IDs.
 * Replace this with your actual implementation.
 * @returns {Array} - Array of liked product IDs.
 */
function getLikedList() {
    // Implement your logic to retrieve liked product IDs
    return [];
}

// Run the main function
main();
