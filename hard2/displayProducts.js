// Flag to simulate slowness; set to false to remove delay after testing
const simulateSlowness = true;
let products = []

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetches the products from the products.json file.
 */
async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();

        products = data.products

        // Default behavior: display products in default order
        // displayProductsDescending(data.products);
        // await sleep(1000);
        // displayProductsAscending(data.products);
        // await sleep(1000);
        // displayProductsRandom(products); // Display in random order
        displayProductsDefault();
    } catch (error) {
        console.error('Error fetching the products:', error);
    }
}

/**
 * Displays the products in the default order as listed in the JSON file.
 * @param {Array} products - The list of products to display.
 */
function displayProductsDefault() {
    // Display products in the order they appear in the JSON file (default order)
    displayProductsAsync(products);
}

/**
 * Displays the products sorted by the return value of the magic function.
 * @param {string} searchString - The search string to process (not used directly here but could be used for filtering).
 */
function displayProductsSearch(searchString) {
    // Sort products by the value returned from magic(product) in ascending order
    const sortedProducts = products
        .map(product => ({ product, magicValue: magicDistance(searchString, product.name) })) // Map each product to its magic value
        .sort((a, b) => a.magicValue - b.magicValue)                // Sort by magicValue in ascending order
        .map(item => item.product);                                 // Extract the sorted product array

    // Display the sorted products
    displayProductsAsync(sortedProducts);
}

/**
 * Asynchronously displays the products sorted by ascending price.
 * @param {Array} products - The list of products to display.
 */
function displayProductsAscending() {
    // Sort products by price in ascending order
    products.sort((a, b) => a.filterable_properties.price - b.filterable_properties.price);
    displayProductsAsync(products);
}

/**
 * Asynchronously displays the products sorted by descending price.
 * @param {Array} products - The list of products to display.
 */
function displayProductsDescending() {
    // Sort products by price in descending order
    products.sort((a, b) => b.filterable_properties.price - a.filterable_properties.price);
    displayProductsAsync(products);
}

/**
 * Asynchronously displays the products in random order.
 * @param {Array} products - The list of products to display.
 */
function displayProductsRandom() {
    // Shuffle the products array
    const shuffledProducts = products
        .map(product => ({ product, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ product }) => product);

    displayProductsAsync(shuffledProducts);
}

/**
 * Asynchronously displays the products in the products container.
 * @param {Array} products - The list of products to display.
 */
function displayProductsAsync(products) {
    const productsBox = document.getElementById('products-container');
    productsBox.innerHTML = ''; // Clear previous products

    let index = 0;
    const batchSize = 1; // Only render one product at a time to simulate slowness

    // Function to generate a random delay between 25 and 500 milliseconds
    function getRandomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function renderBatch() {
        const end = Math.min(index + batchSize, products.length);
        for (let i = index; i < end; i++) {
            createProductElement(productsBox, products[i]);
        }
        index = end;

        // If there are more products to render, queue the next batch
        if (index < products.length) {
            const delay = simulateSlowness ? getRandomDelay(0, 100) : 0; // Random delay for slowness simulation
            setTimeout(renderBatch, delay); // Schedule the next batch
        }
    }

    renderBatch(); // Start rendering the first product
}



/**
 * Creates and appends the product elements to the products box.
 * @param {HTMLElement} productsBox - The container element for the products.
 * @param {Object} product - The product data.
 */
function createProductElement(productsBox, product) {
    const productContainer = document.createElement('div');
    productContainer.classList.add('product');

    const productName = createProductNameElement(product.name);
    const productImage = createProductImageElement(product);
    const productPrice = createProductPriceElement(product.filterable_properties.price); // Create price element
    const starRating = createStarRatingElement(product.filterable_properties.user_rating); // Create star rating element

    const buyButton = createBuyButton(product.product_id); // Create Buy button
    const favoriteButton = createFavoriteButton(product.product_id); // Create Favorite button

    const buttonContainer = document.createElement('div'); // Container for the buttons
    buttonContainer.classList.add('button-container');
    buttonContainer.appendChild(buyButton);
    buttonContainer.appendChild(favoriteButton);

    productContainer.appendChild(productName);
    productContainer.appendChild(productImage);
    productContainer.appendChild(productPrice); // Append price to the container
    productContainer.appendChild(starRating); // Append star rating below the price
    productContainer.appendChild(buttonContainer); // Append the button container

    productsBox.appendChild(productContainer);
}

/**
 * Creates the star rating element based on the product rating.
 * @param {number} rating - The rating of the product (from 0 to 5).
 * @returns {HTMLElement} - The star rating element.
 */
function createStarRatingElement(rating) {
    const starContainer = document.createElement('div');
    starContainer.classList.add('star-rating');

    // Loop to create 5 stars
    for (let i = 1; i <= 5; i++) {
        const starSVG = createStarSVG(Math.min(rating - i + 1, 1)); // Pass fraction of star fill
        starContainer.appendChild(starSVG);
    }

    return starContainer;
}

/**
 * Creates the Buy button.
 * @returns {HTMLElement} - The Buy button element.
 */
function createBuyButton(productId) {
    const buyButton = document.createElement('button');
    buyButton.classList.add('buy-button');

    buyButton.setAttribute('val', productId);

    // Event listener to toggle between "Buy" and "Bought" states
    buyButton.addEventListener('click', function () {
        if (isProductInBought(buyButton.getAttribute('val'))) {
            removeProductFromBought(parseInt(buyButton.getAttribute('val'), 10))
            updateBuy(buyButton)
        } else {
            addProductToBought(parseInt(buyButton.getAttribute('val'), 10));
            updateBuy(buyButton)
        }
    });

    updateBuy(buyButton);

    return buyButton;
}

function updateBuy(buyButton) {
    if (isProductInBought(buyButton.getAttribute('val'))) {
        buyButton.textContent = 'Bought!';
        buyButton.style.backgroundColor = 'limegreen'; // Change color to green
    } else {
        buyButton.textContent = 'Buy!';
        buyButton.style.backgroundColor = 'blue'; // Reset to default color (or specify the original color)
    }
}

/**
 * Creates the Favorite button (Star) using an SVG.
 * @returns {HTMLElement} - The Favorite button element.
 */
function createFavoriteButton(productId) {
    const favoriteButton = document.createElement('button');
    favoriteButton.classList.add('favorite-button');

    // Assign productId to the val attribute
    favoriteButton.setAttribute('val', productId);

    // Create an img element for the star SVG
    const heartSVG = document.createElement('img');
    heartSVG.src = 'https://upload.wikimedia.org/wikipedia/commons/4/42/Love_Heart_SVG.svg';
    heartSVG.alt = 'Favorite';
    heartSVG.classList.add('star-svg');


    // Default style for the unclicked (unfavorited) state
    // Set the default filter
    heartSVG.style.filter = 'brightness(0) saturate(100%) invert(20%) sepia(90%) saturate(5000%) hue-rotate(-10deg) brightness(100%) contrast(110%)';

    // Append the star SVG to the button
    favoriteButton.appendChild(heartSVG);

    // Event listener to toggle the color of the star when clicked
    favoriteButton.addEventListener('click', function () {
        if (isProductInLiked(favoriteButton.getAttribute('val'))) {
            removeProductFromLiked(parseInt(favoriteButton.getAttribute('val'), 10))
            updateFavorited(favoriteButton, heartSVG);
        } else {
            addProductToLiked(parseInt(favoriteButton.getAttribute('val'), 10));
            updateFavorited(favoriteButton, heartSVG);
        }
    });

    updateFavorited(favoriteButton, heartSVG);

    return favoriteButton;
}

function updateFavorited(favoriteButton, heartSVG) {
    // Default style for the unclicked (unfavorited) state
    const defaultFilter = 'brightness(0) saturate(100%) invert(20%) sepia(90%) saturate(5000%) hue-rotate(-10deg) brightness(100%) contrast(110%)';

    // Style for the clicked (favorited) state
    const clickedFilter = 'brightness(0) saturate(100%) invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(70%) contrast(90%)';

    if (isProductInLiked(favoriteButton.getAttribute('val'))) {
        heartSVG.style.filter = defaultFilter; // Reset to the unfavorited state
    } else {
        heartSVG.style.filter = clickedFilter; // Change to the favorited state
    }
}


/**
 * Creates the product name element.
 * @param {string} name - The name of the product.
 * @returns {HTMLElement} - The product name element.
 */
function createProductNameElement(name) {
    const productName = document.createElement('h3');
    productName.textContent = name;
    return productName;
}

/**
 * Creates the product image element.
 * @param {Object} product - The product data.
 * @returns {HTMLElement} - The product image element.
 */
function createProductImageElement(product) {
    const productImage = document.createElement('img');
    productImage.src = product.image_url;
    productImage.alt = product.name;
    productImage.classList.add('product-image');
    return productImage;
}

/**
 * Creates the product price element.
 * @param {number} price - The price of the product.
 * @returns {HTMLElement} - The product price element.
 */
function createProductPriceElement(price) {
    const productPrice = document.createElement('p');

    // Check if price is defined, otherwise show a default message
    if (price !== undefined) {
        // Format price with commas for thousands and two decimal places
        productPrice.textContent = `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
        productPrice.textContent = 'Price not available'; // Fallback message
    }

    productPrice.classList.add('product-price');
    return productPrice;
}

/**
 * Creates an SVG star with partial fill based on the percentage.
 * @param {number} fillPercentage - The percentage of the star to fill (from 0 to 1).
 * @returns {HTMLElement} - The star SVG element.
 */
function createStarSVG(fillPercentage) {
    const svgNS = "http://www.w3.org/2000/svg";
    const starSVG = document.createElementNS(svgNS, "svg");
    starSVG.setAttribute("viewBox", "0 0 24 24");
    starSVG.setAttribute("width", "24");
    starSVG.setAttribute("height", "24");

    // Create the empty star
    const emptyStar = document.createElementNS(svgNS, "polygon");
    emptyStar.setAttribute("points", "12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21");
    emptyStar.setAttribute("fill", "lightgray");
    starSVG.appendChild(emptyStar);

    // Create the full star (with clip for partial fill)
    const fullStar = document.createElementNS(svgNS, "polygon");
    fullStar.setAttribute("points", "12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21");
    fullStar.setAttribute("fill", "gold");

    // Clamp the fill percentage between 0 and 1
    const clampedFill = Math.max(0, Math.min(fillPercentage, 1));

    // Create the clipping mask for partial fill
    const clipPath = document.createElementNS(svgNS, "clipPath");
    clipPath.setAttribute("id", `clip-${Math.random()}`);
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", "0");
    rect.setAttribute("y", "0");
    rect.setAttribute("width", `${clampedFill * 100}%`); // Ensure the width is between 0 and 100%
    rect.setAttribute("height", "100%");
    clipPath.appendChild(rect);

    const defs = document.createElementNS(svgNS, "defs");
    defs.appendChild(clipPath);
    starSVG.appendChild(defs);

    // Apply clipping path to full star
    fullStar.setAttribute("clip-path", `url(#${clipPath.getAttribute("id")})`);
    starSVG.appendChild(fullStar);

    return starSVG;
}



// Fetch and display the products in ascending order by default
fetchProducts();
