function collateFilterablePropertiesWithCounts(products) {
    const filterableProperties = {};

    // Loop through each product and extract its filterable properties
    products.forEach(product => {
        let props = null;

        try{
            props = product.product.filterable_properties;
        } catch (TypeError) {
            props = product.filterable_properties;
        }


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

function getPriceRange(price) {
    const min = Math.floor(price / 200) * 200;
    const max = min + 199;
    return `$${min} - $${max}`;
}

function getRatingRange(rating) {
    const min = Math.floor(rating);
    const max = min + 0.99;
    return `${min} - ${max}`;
}

/**
 * Function to capitalize the first letter of each word in a string.
 * @param {string} str - The input string to be capitalized.
 * @returns {string} - The capitalized string, with the first letter of each word in uppercase.
 */
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

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

            setTimeout(function() {
                displayProductsAI();
            }, 250);
        });

        filtersContainer.appendChild(filterBox); // Append the filter box to the container
    });
}

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

function calculateFilterScores(allProperties, boughtProperties, likedProperties) {
    const filterScores = [];

    // Define weighting factors
    const boughtWeight = 2000; // Higher influence
    const likedWeight = 1000;  // Lower influence

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


async function getFilteredProducts() {
    const response = await fetch('products.json');
    const data = await response.json();

    const products = data.products

    const boughtList = getBoughtList();
    const likedList = getLikedList();
    const selectedFilters = getSelectedFilters(); // Get the selected filters

    const boughtItems = products.filter(product => boughtList.includes(product.product_id)); // Find bought products
    const likedItems = products.filter(product => likedList.includes(product.product_id));   // Find liked products

    // Collate properties from bought and liked items
    const boughtProperties = collateFilterablePropertiesWithCounts(boughtItems);
    const likedProperties = collateFilterablePropertiesWithCounts(likedItems);

    // Define individual weighting factors for each property
    const propertyWeights = {
        'category': {boughtWeight: 5, likedWeight: 2, penaltyWeight: 1},
        'subcategory': {boughtWeight: 3, likedWeight: 1, penaltyWeight: 1},
        'product_type': {boughtWeight: 2, likedWeight: 1, penaltyWeight: 1},
        'colors': {boughtWeight: 2, likedWeight: 1, penaltyWeight: 1},
        'materials': {boughtWeight: 2, likedWeight: 1, penaltyWeight: 1},
        'styles': {boughtWeight: 2, likedWeight: 1, penaltyWeight: 1},
        'features': {boughtWeight: 2, likedWeight: 1, penaltyWeight: 1},
        'brand': {boughtWeight: 2, likedWeight: 1.5, penaltyWeight: 1},
        'user_rating': {boughtWeight: 2, likedWeight: 1, penaltyWeight: 1},
        'price': {boughtWeight: 2, likedWeight: 1, penaltyWeight: 1}
    };

    // General penalty and filter settings
    const penaltyValue = 1;     // Base penalty value for missing a property
    const filterPenalty = 1000; // Penalty for missing selected filters
    const filterPenaltyThreshold = -500; // Minimum score threshold

    // Create an array to store scores for each product
    const productScores = products.map(product => {
        let score = 0;

        // Get the product's filterable properties
        const productProps = product.filterable_properties;

        // List of property keys to check (simple properties)
        const propertyKeys = ['category', 'subcategory', 'product_type'];

        // Check simple properties with individual weights
        propertyKeys.forEach(key => {
            const weights = propertyWeights[key];
            score += weights.boughtWeight * checkAndScoreProperty(productProps[key], boughtProperties);
            score += weights.likedWeight * checkAndScoreProperty(productProps[key], likedProperties);
            score += weights.penaltyWeight * applyPenalty(productProps[key], boughtProperties, likedProperties, penaltyValue);
        });

        // Check array properties like colors, materials, styles, features, brand
        const arrayPropertyKeys = ['colors', 'materials', 'styles', 'features', 'brand'];
        arrayPropertyKeys.forEach(key => {
            const weights = propertyWeights[key];
            if (Array.isArray(productProps[key])) {
                productProps[key].forEach(value => {
                    score += weights.boughtWeight * checkAndScoreProperty(value, boughtProperties);
                    score += weights.likedWeight * checkAndScoreProperty(value, likedProperties);
                    score += weights.penaltyWeight * applyPenalty(value, boughtProperties, likedProperties, penaltyValue);
                });
            }
        });

        // Check numerical properties like user_rating and price ranges
        ['user_rating', 'price'].forEach(key => {
            const weights = propertyWeights[key];
            let valueRange;
            if (key === 'user_rating') {
                valueRange = getRatingRange(productProps[key]);
            } else {
                valueRange = getPriceRange(productProps[key]);
            }
            score += weights.boughtWeight * checkAndScoreProperty(valueRange, boughtProperties);
            score += weights.likedWeight * checkAndScoreProperty(valueRange, likedProperties);
            score += weights.penaltyWeight * applyPenalty(valueRange, boughtProperties, likedProperties, penaltyValue);
        });

        // Apply penalties for missing selected filters
        score += applyFilterPenalties(product, selectedFilters, filterPenalty);

        return {product, score}; // Return the product along with its score
    });

    // Filter out products with score less than the threshold
    const filteredProductScores = productScores.filter(ps => ps.score >= filterPenaltyThreshold);

    // Sort products by score in descending order (most relevant first)
    filteredProductScores.sort((a, b) => b.score - a.score);


    return filteredProductScores;
}



async function main() {
    try {
        const products = await getFilteredProducts();

        // Get bought and liked products
        const boughtList = getBoughtList();
        const likedList = getLikedList();

        const boughtItems = products.filter(product => boughtList.includes(product.product_id));
        const likedItems = products.filter(product => likedList.includes(product.product_id));

        // Collate filterable properties with counts
        const allProperties = collateFilterablePropertiesWithCounts(products);
        const boughtProperties = collateFilterablePropertiesWithCounts(boughtItems);
        const likedProperties = collateFilterablePropertiesWithCounts(likedItems);

        console.log(boughtList)
        console.log(boughtItems)

        // Calculate scores for filters
        const filterScores = calculateFilterScores(allProperties, boughtProperties, likedProperties);

        // Log the sorted filters and their scores
        console.log(filterScores); // Log the filters with their scores

        // Extract the sorted filter keys
        const sortedFilterKeys = filterScores.map(item => item.key);

        // Display the filters
        displayFilterKeys(sortedFilterKeys.slice(0, 50));
    } catch (error) {
        console.error('Error fetching the products:', error);
    }
}


// Run the main function
main();
