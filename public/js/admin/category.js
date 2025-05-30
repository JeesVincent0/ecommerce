window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("categoryButton").addEventListener("click", (e) => {
        e.preventDefault();

        const orderSection = document.getElementById("orderSection")
        orderSection.classList.add("hidden")
        const addButton = document.getElementById("addButton");
        addButton.classList.remove("hidden")

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

        // addSearchAndButtons()
        loadCategory()
    })
});

//this function for get category data and pagination data from server
function loadCategory(page = 1, limit = 5) {

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
    const categoriesContainer = document.getElementById("categorTableBody");
    categoriesContainer.innerHTML = "";

    categories.forEach(category => {
        categoriesContainer.innerHTML += `        
        <td class="py-3 px-6">${category.name}</td>
        <td class="py-3 px-6">${category.slug}</td>
        <td class="py-3 px-6">${category.offers}</td>
        <td class="py-3 px-6 ${category.status === 'active' ? 'text-green-600' : 'text-red-600'}">
          ${category.status === 'active' ? 'Active' : 'Blocked'}
        </td>
        <td class="py-3 px-6">${category.productCount}</td>

        <td class="py-3 px-6">
 
<button 
onclick="blockCategory('${category.slug}')"
  type="button"
  class="blockButton ${category.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white text-sm px-3 py-1 rounded"
  data-id="${category._id}">
  ${category.status === 'active' ? 'Block' : 'Unblock'}
</button>

<button 
  onclick="editCat('${category.slug}')"
  type="button"
  class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
  data-id="${category.slug}">
  Edit
</button>
`
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
    const searchKey = document.getElementById("searchInputCat").value.trim()
    console.log(searchKey)
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
    const searchInput = document.getElementById("searchInputCat");
    const clearButton = document.getElementById("clearSearchButtonCat");

    if (searchInput.value.trim() !== "") {
        clearButton.classList.remove("hidden");
    } else {
        clearButton.classList.add("hidden");
    }
}

//this function will inoke and render user after clicking the clear button
function clearSearchCat() {
    const searchInput = document.getElementById("searchInputCat");
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