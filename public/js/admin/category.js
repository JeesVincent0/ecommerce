window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("categoryButton").addEventListener("click", async (e) => {
        e.preventDefault();

        //Accessing left side button
        const usersButton = document.getElementById("usersButton");
        const categoryButton = document.getElementById("categoryButton");

        //Accessing main session
        const mainUserSession = document.getElementById("mainUserSession");

        //removing other sessions html content from main session
        mainUserSession.classList.add("hidden")
        
        //Changing button pressing color
        usersButton.classList.remove("bg-gray-400");
        categoryButton.classList.add("bg-gray-400");

        //Enable category list section
        const maincategeryListSection = document.getElementById("maincategeryListSection");
        maincategeryListSection.classList.remove("hidden");

        addSearchAndButtons()
        await loadCategory()
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
                onclick="clearSearch()" 
                class="absolute right-28 text-gray-500 hover:text-gray-700 hidden"
                style="font-size: 18px;"
            >
                &times;
            </button>
    
            <button  
                onclick="userSearch()"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
            >
                Search
            </button>
                        <button
                id="addButton"  
                onclick="addCategory()"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
            >
                Add
            
        </div>
    `;
}

//this function for get category data and pagination data from server
async function loadCategory(page = 1, limit = 2) {
    try {
        const res = await fetch(`/categories?page=${page}&limit=${limit}`,{
            method: "GET",
            headers: { "Content-Type" : "application/json" },
        })

        const data = await res.json()

        //after receiving data render category list and pagination bar
        loadCategoryList(data.category)
        pagination(data.totalPages, page)

    } catch (error) {
        console.log(error.message)
    }
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
              <button onclick="blockCategory(${category._id})" id="block" class="blockButton ${category.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white text-sm px-3 py-1 rounded">
                  ${category.isActive ? "Deactive" : "Active"}
              </button>
              <button onclick="editCat(${category._id})" class="bg-gray-700 text-white text-sm px-3 py-1 rounded hover:bg-gray-800">Edit</button>
            </div>
        </div>`
    });

}

function pagination(totalPages, currentPage) {
    const pagination = document.getElementById("paginationContainer")

    pagination.innerHTML = "";

    if (currentPage > 1) {
        pagination.innerHTML = `<button onclick="loadCategory(${currentPage - 1})" class="ml-3 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">&laquo; Prev</button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `<button onclick="loadCategory(${i})"  class="ml-3 px-3 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">${i}</button>`;
    }

    if (currentPage < totalPages) {
        pagination.innerHTML += `<button onclick="loadCategory(${currentPage + 1})"ml-3  class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Next &raquo;</button>`;
    }
}