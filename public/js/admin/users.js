window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("usersButton").addEventListener("click", (e) => {
        e.preventDefault()

        const usersButton = document.getElementById("usersButton");
        const userPage = document.getElementById("userPage");
        const searchButtonContainer = document.getElementById("searchBarContainer")

        searchButtonContainer.innerHTML = "";

        usersButton.classList.add("bg-gray-400");
        searchButtonContainer.innerHTML += `
        <div class="flex items-center space-x-2 mr-4 relative">
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
        </div>
    `;

        loadUsers()
        userPage.classList.remove("hidden");

    })
})


//this function will collect users from server
function loadUsers(page = 1, limit = 2) {

    fetch(`/users?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {

            //after getting users, invoke function for render user card and pagination bar
            renderUsers(data.users);
            renderPagination(data.totalPages, page, loadUsers);
        })
        .catch((err) => {
            console.log(err.message)
        })
}


//this function for render user cards in the mainsession
function renderUsers(users) {
    const container = document.getElementById("userListContainer");
    container.innerHTML = "";

    //loop through each user for render user cards for users
    users.forEach(user => {
        container.innerHTML += `
        <div class="userCard bg-white p-4 rounded-xl shadow flex flex-wrap items-center justify-between gap-4 hover:shadow-xl hover:scale-101">
            <span id="userEmail" class="userEmail hidden">${user.email}</span>
            <div class="text-base sm:text-lg font-semibold min-w-[120px]">${user.name}</div>
            <div class="flex flex-wrap gap-2 justify-end sm:justify-start">
              <button id="block" class="blockButton ${user.isActive ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"} text-white text-sm px-3 py-1 rounded">
                  ${user.isActive ? "Block" : "Unblock"}
              </button>
              <!-- <button class="bg-gray-700 text-white text-sm px-3 py-1 rounded hover:bg-gray-800">Check Activity</button> -->
            </div>
        </div>`;
    });

    //After adding all users, NOW add event listeners only ONCE
    document.querySelectorAll(".blockButton").forEach(button => {
        button.addEventListener("click", async (e) => {
            const userCard = e.target.closest(".userCard");
            const email = userCard.querySelector(".userEmail").textContent.trim();
            console.log("Email:", email);

            const isBlocked = e.target.textContent === "Block";
            if (isBlocked) {

                //approve function will ivoke for admin confirmation for user block
                approve(email, e.target)

            } else {
                
                //This function invoked for unblock user
                const success = await UnBlockUser(email);

                if (success) {
                    //after unblocking the user bock/unblock button color and value will change
                    e.target.textContent = "Block";
                    e.target.classList.remove("bg-blue-600", "hover:bg-blue-700");
                    e.target.classList.add("bg-red-600", "hover:bg-red-700");
                }
            }
        });
    });
}

//before blocking a pop will come for get confirmation from admin
function approve(email, buttonElement) {
    const confirmationContainer = document.getElementById("confirmationContainer");
    confirmationContainer.innerHTML = "";
    confirmationContainer.innerHTML = `
        <div id="blockModal" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div class="bg-white p-6 rounded-xl shadow-lg w-96">
                <h3 class="text-xl font-semibold mb-4">Are you sure?</h3>
                <p class="mb-4">Do you want to block this user?</p>
                <div class="flex justify-between">
                    <button onclick="closePopUp()" class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm">Cancel</button>
                    <button onclick="confirmBlock('${email}')" class="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-sm" data-button-id="${buttonElement.id}">Yes, Block</button>
                </div>
            </div>
        </div>`;
}

//if the admin reject the confirmation/after blocking the pop will disapear
function closePopUp() {
    const confirmationContainer = document.getElementById("confirmationContainer");
    confirmationContainer.innerHTML = "";
}

async function confirmBlock(email) {
    const success = await blockUser(email);
    if (success) {
        const buttons = document.querySelectorAll(".blockButton");
        buttons.forEach(button => {
            const userCard = button.closest(".userCard");
            const userEmail = userCard.querySelector(".userEmail").textContent.trim();
            if (userEmail === email) {
                button.textContent = "Unblock";
                button.classList.remove("bg-red-600", "hover:bg-red-700");
                button.classList.add("bg-blue-600", "hover:bg-blue-700");
            }
        });
    }
    closePopUp();
}

//this function is for render pagination bar
function renderPagination(totalPages, currentPage, callback) {
    const pagination = document.getElementById("paginationContainer")

    pagination.innerHTML = "";

    if (currentPage > 1) {
        pagination.innerHTML = `<button onclick="${callback.name}(${currentPage - 1})" class="ml-3 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">&laquo; Prev</button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `<button onclick="${callback.name}(${i})"  class="ml-3 px-3 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">${i}</button>`;
    }

    if (currentPage < totalPages) {
        pagination.innerHTML += `<button onclick="${callback.name}(${currentPage + 1})"ml-3  class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Next &raquo;</button>`;
    }
}


//this function is for unblock user
async function blockUser(email) {
    try {
        const res = await fetch(`/users/block?email=${email}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        const data = await res.json();
        console.log(data.message || "User Blocked")
        return true
    } catch (error) {
        console.log(error.message)
        return false
    }
}


//this function is for unblock user
async function UnBlockUser(email) {
    try {
        const res = await fetch(`/users/unblock?email=${email}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        })
        const data = await res.json()
        console.log(data.message || "User unblocked")

        return true
    } catch (error) {
        console.log(error.message)
    }
}


//this function for search bar for user search
function userSearch(page = 1, limit = 2) {
    const searchKey = document.getElementById("searchInput").value.trim()
    console.log("user search", searchKey)

    fetch(`/users/search?key=${searchKey}&page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.json())
        .then((data) => {
            renderUsers(data.users)
            renderPagination(data.totalPages, page, userSearch)
        })
        .catch((error) => console.log(error.message))
}

//this button function is for search clear button
function toggleClearButton() {
    const searchInput = document.getElementById("searchInput");
    const clearButton = document.getElementById("clearSearchButton");

    if (searchInput.value.trim() !== "") {
        clearButton.classList.remove("hidden");
    } else {
        clearButton.classList.add("hidden");
    }
}

//this function will inoke and render user after clicking the clear button
function clearSearch() {
    const searchInput = document.getElementById("searchInput");
    searchInput.value = "";
    toggleClearButton();
    loadUsers()
}
