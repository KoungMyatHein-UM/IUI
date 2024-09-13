/**
 * Handles the sorting when the user selects an option from the dropdown.
 * @param {Event} event - The change event from the dropdown.
 */
function handleSortChange(event) {
    const selectedOption = event.target.value;
    fetchProductsBySort(selectedOption);
}

/**
 * Fetches and displays products based on the selected sort option.
 * @param {string} sortOption - The selected sorting option.
 */
async function fetchProductsBySort(sortOption) {
    try {
        // Handle the sorting based on the selected option
        switch (sortOption) {
            case 'ascending':
                displayProductsAscending();
                break;
            case 'descending':
                displayProductsDescending();
                break;
            case 'random':
                displayProductsRandom();
                break;
            case 'default':
            default:
                displayProductsDefault();
                break;
        }
    } catch (error) {
        console.error('Error fetching the products:', error);
    }
}
