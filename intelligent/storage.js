/**
 * Adds a product ID to the "bought" list in local storage.
 * @param {number} productId - The ID of the product to add.
 */
function addProductToBought(productId) {
    // Retrieve the existing "bought" array from local storage, or initialize an empty array
    let boughtList = JSON.parse(localStorage.getItem('bought')) || [];

    // Add the new product ID to the list if it's not already present
    if (!boughtList.includes(productId)) {
        boughtList.push(productId);
        localStorage.setItem('bought', JSON.stringify(boughtList)); // Store the updated array back into local storage
    }
}

/**
 * Retrieves the "bought" list from local storage.
 * @returns {Array} - The list of bought product IDs.
 */
function getBoughtList() {
    return JSON.parse(localStorage.getItem('bought')) || []; // Return the array or an empty array if not found
}

/**
 * Removes a product ID from the "bought" list in local storage.
 * @param {number} productId - The ID of the product to remove.
 */
function removeProductFromBought(productId) {
    // Retrieve the existing "bought" array from local storage
    let boughtList = JSON.parse(localStorage.getItem('bought')) || [];

    // Check if the product ID exists and remove it
    boughtList = boughtList.filter(id => id !== productId);
    localStorage.setItem('bought', JSON.stringify(boughtList)); // Store the updated array back into local storage
}

/**
 * Checks if a product ID exists in the "bought" list.
 * @param {number|string} productId - The ID of the product to check.
 * @returns {boolean} - True if the product ID exists in the "bought" list, false otherwise.
 */
function isProductInBought(productId) {
    const boughtList = JSON.parse(localStorage.getItem('bought')) || [];

    // Convert productId to a number to ensure type consistency
    const numericProductId = Number(productId);
    return boughtList.includes(numericProductId); // Return true if the product ID exists
}

/**
 * Clears the "bought" list from local storage.
 */
function clearBoughtList() {
    localStorage.removeItem('bought'); // Remove the "bought" item from local storage
}








/**
 * Adds a product ID to the "liked" list in local storage.
 * @param {number|string} productId - The ID of the product to add.
 */
function addProductToLiked(productId) {
    // Retrieve the existing "liked" array from local storage, or initialize an empty array
    let likedList = JSON.parse(localStorage.getItem('liked')) || [];

    // Add the new product ID to the list if it's not already present
    const numericProductId = Number(productId);
    if (!likedList.includes(numericProductId)) {
        likedList.push(numericProductId);
        localStorage.setItem('liked', JSON.stringify(likedList)); // Store the updated array back into local storage
    }
}

/**
 * Retrieves the "liked" list from local storage.
 * @returns {Array} - The list of liked product IDs.
 */
function getLikedList() {
    return JSON.parse(localStorage.getItem('liked')) || []; // Return the array or an empty array if not found
}

/**
 * Removes a product ID from the "liked" list in local storage.
 * @param {number|string} productId - The ID of the product to remove.
 */
function removeProductFromLiked(productId) {
    // Retrieve the existing "liked" array from local storage
    let likedList = JSON.parse(localStorage.getItem('liked')) || [];

    // Convert productId to a number to ensure type consistency
    const numericProductId = Number(productId);

    // Check if the product ID exists and remove it
    likedList = likedList.filter(id => id !== numericProductId);
    localStorage.setItem('liked', JSON.stringify(likedList)); // Store the updated array back into local storage
}

/**
 * Checks if a product ID exists in the "liked" list.
 * @param {number|string} productId - The ID of the product to check.
 * @returns {boolean} - True if the product ID exists in the "liked" list, false otherwise.
 */
function isProductInLiked(productId) {
    const likedList = JSON.parse(localStorage.getItem('liked')) || [];

    // Convert productId to a number to ensure type consistency
    const numericProductId = Number(productId);
    return likedList.includes(numericProductId); // Return true if the product ID exists
}

/**
 * Clears the "liked" list from local storage.
 */
function clearLikedList() {
    localStorage.removeItem('liked'); // Remove the "liked" item from local storage
}















/**
 * Adds a filter key to the selected filters in local storage.
 * @param {string} filterKey - The key of the filter to add.
 */
function addSelectedFilter(filterKey) {
    let selectedFilters = JSON.parse(localStorage.getItem('selectedFilters')) || [];
    if (!selectedFilters.includes(filterKey)) {
        selectedFilters.push(filterKey);
        localStorage.setItem('selectedFilters', JSON.stringify(selectedFilters));
    }
}

/**
 * Removes a filter key from the selected filters in local storage.
 * @param {string} filterKey - The key of the filter to remove.
 */
function removeSelectedFilter(filterKey) {
    let selectedFilters = JSON.parse(localStorage.getItem('selectedFilters')) || [];
    selectedFilters = selectedFilters.filter(key => key !== filterKey);
    localStorage.setItem('selectedFilters', JSON.stringify(selectedFilters));
}

/**
 * Retrieves the selected filters from local storage.
 * @returns {Array} - An array of selected filter keys.
 */
function getSelectedFilters() {
    return JSON.parse(localStorage.getItem('selectedFilters')) || [];
}