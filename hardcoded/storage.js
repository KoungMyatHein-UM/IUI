function getContext() {
    return window.location.pathname.split('/').filter(Boolean)[0];
}

/**
 * Adds a product ID to the "bought" list in local storage.
 * @param {number} productId - The ID of the product to add.
 */
function addProductToBought(productId) {
    // Retrieve the existing "bought" array from local storage, or initialize an empty array
    let boughtList = JSON.parse(localStorage.getItem(`${getContext()}_bought`)) || [];

    // Add the new product ID to the list if it's not already present
    if (!boughtList.includes(productId)) {
        boughtList.push(productId);
        localStorage.setItem(`${getContext()}_bought`, JSON.stringify(boughtList)); // Store the updated array back into local storage
    }
}

/**
 * Retrieves the "bought" list from local storage.
 * @returns {Array} - The list of bought product IDs.
 */
function getBoughtList() {
    return JSON.parse(localStorage.getItem(`${getContext()}_bought`)) || []; // Return the array or an empty array if not found
}

/**
 * Removes a product ID from the "bought" list in local storage.
 * @param {number} productId - The ID of the product to remove.
 */
function removeProductFromBought(productId) {
    // Retrieve the existing "bought" array from local storage
    let boughtList = JSON.parse(localStorage.getItem(`${getContext()}_bought`)) || [];

    // Check if the product ID exists and remove it
    boughtList = boughtList.filter(id => id !== productId);
    localStorage.setItem(`${getContext()}_bought`, JSON.stringify(boughtList)); // Store the updated array back into local storage
}

/**
 * Checks if a product ID exists in the "bought" list.
 * @param {number|string} productId - The ID of the product to check.
 * @returns {boolean} - True if the product ID exists in the "bought" list, false otherwise.
 */
function isProductInBought(productId) {
    const boughtList = JSON.parse(localStorage.getItem(`${getContext()}_bought`)) || [];

    // Convert productId to a number to ensure type consistency
    const numericProductId = Number(productId);
    return boughtList.includes(numericProductId); // Return true if the product ID exists
}

/**
 * Clears the "bought" list from local storage.
 */
function clearBoughtList() {
    localStorage.removeItem(`${getContext()}_bought`); // Remove the "bought" item from local storage
}








/**
 * Adds a product ID to the "liked" list in local storage.
 * @param {number|string} productId - The ID of the product to add.
 */
function addProductToLiked(productId) {
    // Retrieve the existing "liked" array from local storage, or initialize an empty array
    let likedList = JSON.parse(localStorage.getItem(`${getContext()}_liked`)) || [];

    // Add the new product ID to the list if it's not already present
    const numericProductId = Number(productId);
    if (!likedList.includes(numericProductId)) {
        likedList.push(numericProductId);
        localStorage.setItem(`${getContext()}_liked`, JSON.stringify(likedList)); // Store the updated array back into local storage
    }
}

/**
 * Retrieves the "liked" list from local storage.
 * @returns {Array} - The list of liked product IDs.
 */
function getLikedList() {
    return JSON.parse(localStorage.getItem(`${getContext()}_liked`)) || []; // Return the array or an empty array if not found
}

/**
 * Removes a product ID from the "liked" list in local storage.
 * @param {number|string} productId - The ID of the product to remove.
 */
function removeProductFromLiked(productId) {
    // Retrieve the existing "liked" array from local storage
    let likedList = JSON.parse(localStorage.getItem(`${getContext()}_liked`)) || [];

    // Convert productId to a number to ensure type consistency
    const numericProductId = Number(productId);

    // Check if the product ID exists and remove it
    likedList = likedList.filter(id => id !== numericProductId);
    localStorage.setItem(`${getContext()}_liked`, JSON.stringify(likedList)); // Store the updated array back into local storage
}

/**
 * Checks if a product ID exists in the "liked" list.
 * @param {number|string} productId - The ID of the product to check.
 * @returns {boolean} - True if the product ID exists in the "liked" list, false otherwise.
 */
function isProductInLiked(productId) {
    const likedList = JSON.parse(localStorage.getItem(`${getContext()}_liked`)) || [];

    // Convert productId to a number to ensure type consistency
    const numericProductId = Number(productId);
    return likedList.includes(numericProductId); // Return true if the product ID exists
}

/**
 * Clears the "liked" list from local storage.
 */
function clearLikedList() {
    localStorage.removeItem(`${getContext()}_liked`); // Remove the "liked" item from local storage
}
