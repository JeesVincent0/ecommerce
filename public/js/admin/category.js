window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("categoryButton").addEventListener("click", (e) => {
        e.preventDefault();

        //Accessing left side button
        const usersButton = document.getElementById("usersButton");
        const categoryButton = document.getElementById("categoryButton");
        const productsButton = document.getElementById("productsButton")

        const productListingSection = document.getElementById("productListingSection");
        productListingSection.classList.add("hidden")

        //Accessing main session
        const mainUserSession = document.getElementById("mainUserSession");
        const addCategorySection = document.getElementById("maincategeryAddSection")

        //removing other sessions html content from main session
        mainUserSession.classList.add("hidden")
        addCategorySection.classList.add("hidden")

        //Changing button pressing color
        productsButton.classList.remove("bg-gray-400")
        usersButton.classList.remove("bg-gray-400");
        categoryButton.classList.add("bg-gray-400");

        //disable edit category form
        const editCategoryForm = document.getElementById("maincategeryEditSection")
        editCategoryForm.classList.add("hidden")

        //Enable category list section
        const maincategeryListSection = document.getElementById("maincategeryListSection");
        maincategeryListSection.classList.remove("hidden");

        addSearchAndButtons()
        loadCategory()
    })
});

//setting search bar, category edit and add button on navbar
function addSearchAndButtons() {

    //Accessing navbar search div
    const searchBarContainer = document.getElementById("searchBarContainer");

    //setting html content
    searchBarContainer.innerHTML = "";
    searchBarContainer.innerHTML = `<div class="flex items-center space-x-2 mr-4 relative">
            <span class="hidden" id="searchSpan"></span>
             <button
                id="addButton"  
                onclick="addCategory()"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
            >
                Add </button>
            <input 
                id="searchInput" 
                type="text" 
                placeholder="Search..."
                oninput="toggleClearButton()" 
                class="bg-white px-3 py-1 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8" 
            />
            
            <!-- Clear Button -->
            <button 
                id="clearSearchButton" 
                onclick="clearSearchCat()" 
                class="absolute right-28 text-gray-500 hover:text-gray-700 hidden"
                style="font-size: 18px;"
            >
                &times;
            </button>
    
            <button  
                onclick="categorySearch()"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
            >
                Search
            </button>
                       
            
        </div>
    `;
}

//this function for get category data and pagination data from server
function loadCategory(page = 1, limit = 2) {

    fetch(`/category?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data)
            console.log(page)
            loadCategoryList(data.categoryList)
            pagination(data.totalPages, page, loadCategory)
        })
}

//listing category in the main session
function loadCategoryList(categories) {

    //getting category listing section
    const categoriesContainer = document.getElementById("categoriesContainer");
    categoriesContainer.innerHTML = "";

    //loop through categoryies for list cards
    categories.forEach(category => {
        categoriesContainer.innerHTML += `        
        <div class="userCard bg-white p-4 rounded-xl shadow flex flex-wrap items-center justify-between gap-4 hover:shadow-xl hover:scale-101">
            <div class="text-base sm:text-lg font-semibold min-w-[120px]">${category.name}</div>
            <div class="flex flex-wrap gap-2 justify-end sm:justify-start">
              <button onclick="blockCategory('${category.slug}')" id="block" class="blockButton ${category.status === 'active' ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white text-sm px-3 py-1 rounded">
                  ${category.status === 'active' ? "Deactive" : "Active"}
              </button>
              <button onclick="editCat('${category.slug}')" class="bg-gray-700 text-white text-sm px-3 py-1 rounded hover:bg-gray-800">Edit</button>
            </div>
        </div>`
    });

}

function pagination(totalPages, currentPage, callback) {

    const pagination = document.getElementById("paginationContainer1");
    pagination.innerHTML = "";
    if (currentPage > 1) {
        pagination.innerHTML += `<button onclick="${callback.name}(${currentPage - 1})" class="ml-3 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">&laquo; Prev</button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `<button onclick="${callback.name}(${i})" class="ml-3 px-3 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">${i}</button>`;
    }

    if (currentPage < totalPages) {
        pagination.innerHTML += `<button onclick="${callback.name}(${currentPage + 1})" class="ml-3 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Next &raquo;</button>`;
    }
}

//this function for search bar for user search
function categorySearch(page = 1, limit = 2) {
    const searchKey = document.getElementById("searchInput").value.trim()
    console.log("category search", searchKey)

    fetch(`/category/search?key=${searchKey}&page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("search data", data)
            loadCategoryList(data.categoryList)
            pagination(data.totalPages, page, categorySearch)
        })
        .catch((error) => console.log(error.message))
}

//this button function is for search clear button
function toggleClearButtonCat() {
    const searchInput = document.getElementById("searchInput");
    const clearButton = document.getElementById("clearSearchButton");

    if (searchInput.value.trim() !== "") {
        clearButton.classList.remove("hidden");
    } else {
        clearButton.classList.add("hidden");
    }
}

//this function will inoke and render user after clicking the clear button
function clearSearchCat() {
    const searchInput = document.getElementById("searchInput");
    searchInput.value = "";
    toggleClearButtonCat();
    loadCategory()
}

function blockCategory(slug) {
    fetch(`/category/block/${slug}`, {
        method: "PATCH", // because we are modifying
        headers: { "Content-Type": "application/json" }
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.status) {
            // Successfully updated, reload category list
            loadCategory();
        } else {
            console.error(data.message || "Failed to update category status");
        }
    })
    .catch((error) => {
        console.error("Error updating category:", error);
    });
}
