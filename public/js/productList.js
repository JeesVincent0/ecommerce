function fetchProduct(page = 1, limit = 2) {
    const form = document.getElementById("filterForm");
    const formData = new FormData(form);

    const searchKey = document.getElementById("userSearch").value.trim();
    const priceSort = formData.get('priceSort');
    const nameSort = formData.get('nameSort');
    const category_slug = formData.get('category_slug');
    const minPrice = formData.get("minPrice")
    const maxPrice = formData.get("maxPrice")

    const query = new URLSearchParams({
        key: searchKey,
        price: priceSort,
        name: nameSort,
        category: category_slug,
        minPrice: minPrice,
        maxPrice: maxPrice,
        limit: limit,
        page: page
    });

    getProduct(query)

}

function productSearch() {
    const searchKey = document.getElementById("userSearch").value.trim();
    const query = new URLSearchParams({
        key: searchKey,
    })

    if(searchKey){
    window.location.href = `/productlist?${query.toString()}`
    }
}

function getProduct(query) {

    fetch(`/product?${query.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            renderProducts(data.products);
            productPagination(data.totalPages, data.page)
            const clearBtn = document.getElementById("clearSearchButton")
            clearBtn.classList.remove("hidden");
        })
        .catch((error) => console.log(error.message));
}

function renderProducts(products) {
    const productContainer = document.getElementById("productContainer");
    productContainer.innerHTML = "";

    products.forEach(product => {
        let stars = "☆☆☆☆☆";
        if (product.ratings >= 4.5) stars = "★★★★★";
        else if (product.ratings >= 4) stars = "★★★★☆";
        else if (product.ratings >= 3) stars = "★★★☆☆";
        else if (product.ratings >= 2) stars = "★★☆☆☆";
        else if (product.ratings >= 1) stars = "★☆☆☆☆";

        const productCard = `
            <div onclick="goToProduct('${product._id}')" class="w-full max-w-sm bg-white rounded-xl shadow-md overflow-hidden aspect-[1/1.03] flex flex-col">
                <!-- Image -->
                <div class="h-2/4 w-full">
                    <img src="http://localhost:3000/${product.images && product.images[0] ? product.images[0] : 'default.jpg'}"
                        alt="Product Image" class="w-full h-full object-cover">
                </div>

                <!-- Details -->
                <div class="h-1/3 p-4 flex flex-col justify-between">
                    <div>
                        <h2 class="text-base font-semibold truncate">${product.product_name}</h2>

                        <!-- Ratings -->
                        <div class="flex items-center space-x-1 text-yellow-500 text-sm">
                            <span>${stars}</span>
                            <span class="text-gray-500 text-xs">(${product.total_reviews?.length || 0})</span>
                        </div>

                        <!-- Price -->
                        <div class="mt-1">
                            <span class="text-lg font-bold text-green-600">₹${product.last_price}</span>
                            <span class="text-sm text-gray-500 line-through ml-2">₹${product.mrp}</span>
                            <span class="text-sm text-red-500 ml-1">${product.discount_percentage}% off</span>
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="mt-2 flex justify-between items-center">
                        <button onclick="event.stopPropagation(); buyNow('${product._id}')" class="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700">Buy Now</button>
                        <button class="text-gray-500 hover:text-red-500">❤️</button>
                    </div>
                </div>
            </div>`;

        productContainer.innerHTML += productCard;
    });
}

function renderCategory() {
    const categoryOptionsUser = document.getElementById("categoryOptionsUser");
    categoryOptionsUser.innerHTML = "";

    fetch("/product/category", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.categoyNames) {
                const categories = Array.isArray(data.categoyNames) ? data.categoyNames : [data.categoyNames];
                categories.forEach(category => {
                    categoryOptionsUser.innerHTML += `<option value="${category.slug}">${category.slug}</option>`;
                });
            }
        });
}

function applyFilter() {
    fetchProduct();
}

function goToProduct(productId) {
    window.location.href = `/product/view/${productId}`;
}

function buyNow(productId) {
    window.location.href = `/order/place/${productId}`;
}

function toggleClearButtonProducts() {
    const input = document.getElementById("userSearch");
    const clearBtn = document.getElementById("clearSearchButton");

    if (input.value.trim() != "") {
        clearBtn.classList.remove("hidden");
    } else {
        clearBtn.classList.add("hidden");
    }
}

function clearSearchProduct() {
    document.getElementById("userSearch").value = "";
    document.getElementById("clearSearchButton").classList.add("hidden");
    document.getElementById("filterForm").reset();
    window.location.href = "/home"; // refresh product list with no search key
}



function productPagination(totalPages, currentPage) {
    console.log("pagination reached")
    const pagination = document.getElementById("paginationContainer");
    pagination.innerHTML = "";
    if (currentPage > 1) {
        pagination.innerHTML += `<button onclick="fetchProduct(${currentPage - 1})" class="ml-3 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">&laquo; Prev</button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `<button onclick="fetchProduct(${i})" class="ml-3 px-3 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">${i}</button>`;
    }

    if (currentPage < totalPages) {
        pagination.innerHTML += `<button onclick="fetchProduct(${currentPage + 1})" class="ml-3 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Next &raquo;</button>`;
    }
}

// Initial calls
fetchProduct();
renderCategory();