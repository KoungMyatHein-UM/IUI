/**
 * Fetches the products from the products.json file and collates all filterable properties with counts.
 */
async function fetchAndCollateFilterableProperties() {
    try {
        const response = await fetch('products.json'); // Fetch the products from the JSON file
        const data = await response.json();
        const products = data.products;

        // Collate all filterable properties with counts
        const filterablePropertiesWithCounts = collateFilterablePropertiesWithCounts(products);

        console.log(filterablePropertiesWithCounts); // Display the collated properties with counts
        return filterablePropertiesWithCounts;
    } catch (error) {
        console.error('Error fetching the products:', error);
    }
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

    // Loop through each key and create a box for it
    keys.forEach((key, index) => {
        const filterBox = document.createElement('div');
        filterBox.classList.add('filter-box-item'); // Add CSS class for styling
        filterBox.textContent = capitalizeWords(key); // Set the text content to the key

        // Save the initial position for later restoration
        originalOrder.push({ element: filterBox, position: index });


        // if (['wireless', 'electronics', 'black', 'plastic', 'bluetooth', '$0 - $199', 'audio'].includes(key)) {
        //     filterBox.classList.add('active');
        //     filtersContainer.insertBefore(filterBox, filtersContainer.firstChild);
        // }

        // Add click event listener to toggle color on click and move element
        filterBox.addEventListener('click', () => {
            if (filterBox.classList.contains('active')) {
                // If already active, unclick: remove 'active' and restore position
                filterBox.classList.remove('active');
                restoreOriginalPosition(filtersContainer, filterBox, originalOrder);
            } else {
                // If not active, click: add 'active' and move to top
                filterBox.classList.add('active');
                filtersContainer.insertBefore(filterBox, filtersContainer.firstChild);
            }
        });

        filtersContainer.appendChild(filterBox); // Append the filter box to the container
    });
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
        const currentElements = Array.from(container.children);
        const currentIndex = currentElements.indexOf(element);

        // If the element has moved, put it back to its original position
        if (currentIndex !== original.position) {
            container.removeChild(element);
            container.insertBefore(element, container.children[original.position]);
        }
    }
}

/**
 * Main function to fetch, collate, and flatten the filterable properties.
 */
async function main() {
    const filterableProperties = await fetchAndCollateFilterableProperties(); // Wait for the properties to be fetched and collated
    const flattenedProperties = flattenObject(filterableProperties); // Flatten the collated properties

    const keys = flattenedProperties.map(item => item.split(': ')[0]); // Extract keys from "key: value" format
    const first50Keys = keys.slice(0, keys.length);  // Get the first 50 elements
    displayFilterKeys(first50Keys);
    console.log(flattenedProperties); // Log the flattened properties
}

// Run the main function
main();
