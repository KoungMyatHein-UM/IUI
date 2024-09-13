function doSearch(event) {
    event.preventDefault(); // Prevent form submission

    // Get the value of the search input
    var searchText = document.getElementById('search-input').value;
    displayProductsSearch(searchText);
}
