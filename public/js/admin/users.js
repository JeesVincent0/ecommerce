let currentUserPage = 1;

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("usersButton").addEventListener("click", (e) => {
        e.preventDefault();

        //hide other section
        hideProductList();
        hideCategoryList();
        hideEditCategorySection();
        hideAddCategorySection();
        accessSalesReportSection();
         const orderSection = document.getElementById("orderSection")
    orderSection.classList.add("hidden")

        //change side button color
        hideCategoryButton();
        hideProductButton();

        const confirmationContainer = document.getElementById("confirmationContainer");
        confirmationContainer.innerHTML = "";


        const usersections1 = document.getElementById("usersections1");
        usersections1.classList.remove("hidden");

        const usersections = document.getElementById("usersections");
        usersections.classList.remove("hidden");

        const paginationContainer = document.getElementById("paginationContainer");
        paginationContainer.classList.remove("hidden");

        //add user button color
        addUserButton()

        const mainUserSession = document.getElementById("mainUserSession");
        mainUserSession.classList.remove("hidden")

        loadUsers()
        const userPage = document.getElementById("userPage");
        userPage.classList.remove("hidden");

    })
})


//this function will collect users from server
function loadUsers(page = 1, limit = 9) {
    currentUserPage = page;

    fetch(`/users?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            renderUsers(data.users);
            renderPagination(data.totalPages, page, loadUsers);
        })
        .catch((err) => {
            console.log(err.message)
        })
}



//this function for render user cards in the mainsession
function renderUsers(users) {
    const container = document.getElementById("userTableBody");
    container.innerHTML = ""; // Clear all rows

    users.forEach(user => {
        const row = document.createElement("tr");
        row.className = "border-b border-gray-200 hover:bg-gray-100";

        row.innerHTML = `
        <td class="py-3 px-6">${user.name}</td>
        <td class="py-3 px-6">${user.email}</td>
        <td class="py-3 px-6 ${user.isActive ? 'text-green-600' : 'text-red-600'}">
          ${user.isActive ? 'Active' : 'Blocked'}
        </td>
        <td class="py-3 px-6">
          <button 
          onclick="view('${user.email}')"
            type="button"
            class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded ml-1">
            View
          </button>  
          <button 
            type="button"
            class="blockButton ${user.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            text-white text-sm px-3 py-1 rounded"
            data-email="${user.email}">
            ${user.isActive ? 'Block' : 'Unblock'}
          </button>
          
        </td>
      `;

        container.appendChild(row);
    });

    // Attach event listeners to block/unblock buttons
    document.querySelectorAll(".blockButton").forEach(button => {
        button.addEventListener("click", async (e) => {
            const email = e.target.dataset.email;
            const isBlocked = e.target.textContent.trim() === "Block";

            if (isBlocked) {
                // Ask for confirmation before blocking
                approve(email, e.target); // define this function elsewhere
            } else {
                const success = await UnBlockUser(email); // define this function elsewhere
                if (success) {
                    loadUsers(currentUserPage); // Refresh same page
                }
            }
        });
    });
}


//before blocking a pop will come for get confirmation from admin
function approve(email, buttonElement) {
    const confirmationContainer = document.getElementById("confirmationContainer");
    confirmationContainer.innerHTML = `
        <div id="blockModal" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div class="bg-white p-6 rounded-xl shadow-lg w-96">
                <h3 class="text-xl font-semibold mb-4">Are you sure?</h3>
                <p class="mb-4">Do you want to block this user?</p>
                <div class="flex justify-between">
                    <button id="cancelBlockBtn" class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm">Cancel</button>
                    <button id="confirmBlockBtn" class="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-sm">Yes, Block</button>
                </div>
            </div>
        </div>
    `;

    // Add listeners after element is in DOM
    document.getElementById("cancelBlockBtn").addEventListener("click", closePopUp);

    document.getElementById("confirmBlockBtn").addEventListener("click", async () => {
        const success = await blockUser(email);
        if (success) {
            loadUsers(currentUserPage); // Reload the current page
            closePopUp();
        }
    });

}

//if the admin reject the confirmation/after blocking the pop will disapear
function closePopUp() {
    const confirmationContainer = document.getElementById("confirmationContainer");
    confirmationContainer.innerHTML = "";
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
function userSearch(page = 1, limit = 9) {
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


let sortDirection = [true, true];
function sortTable(colIndex) {
    const tbody = document.getElementById("userTableBody");
    const rows = Array.from(tbody.rows);

    rows.sort((a, b) => {
        const cellA = a.cells[colIndex].innerText.toLowerCase();
        const cellB = b.cells[colIndex].innerText.toLowerCase();
        if (cellA < cellB) return sortDirection[colIndex] ? -1 : 1;
        if (cellA > cellB) return sortDirection[colIndex] ? 1 : -1;
        return 0;
    });

    sortDirection[colIndex] = !sortDirection[colIndex];
    tbody.innerHTML = "";
    rows.forEach(row => tbody.appendChild(row));
}

function view(email) {
    fetch(`user-details/${email}`, {
        method: "GET"
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                renderUserDetails(data.details)

            }
        })
}


function renderUserDetails(details) {
    console.log(details);

    const user = details.user;
    const orders = details.orders;

    const usersections1 = document.getElementById("usersections1");
    usersections1.classList.add("hidden");

    const usersections = document.getElementById("usersections");
    usersections.classList.add("hidden");

    const paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.classList.add("hidden");

    const confirmationContainer = document.getElementById("confirmationContainer");

    // User Info Section
    confirmationContainer.innerHTML = `
        <div class="max-w-xl mx-auto mt-3 space-y-6 text-gray-800">
            <!-- Profile Image -->
            <div class="flex justify-center">
                <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-300">
                    <img src="http://localhost:3000/user/${user.email}/profile-pic" 
                         alt="Profile" 
                         class="w-full h-full object-cover" />
                </div>
            </div>

            <!-- User Info -->
            <div class="space-y-4">
                <div class="flex items-center">
                    <label class="w-24 font-medium">Name:</label>
                    <div class="flex-1 bg-gray-200 px-3 py-1 rounded-md">${user.name}</div>
                </div>
                <div class="flex items-center">
                    <label class="w-24 font-medium">Email:</label>
                    <div class="flex-1 bg-gray-200 px-3 py-1 rounded-md">${user.email}</div>
                </div>
                <div class="flex items-center">
                    <label class="w-24 font-medium">Phone:</label>
                    <div class="flex-1 bg-gray-200 px-3 py-1 rounded-md">${user.phone || "Not added"}</div>
                </div>
            </div>

        </div>
    `;

    // Address Section
    if (user.addresses && Array.isArray(user.addresses)) {
        user.addresses.forEach(address => {
            confirmationContainer.innerHTML += `
                <div class="space-y-3 mt-6 border p-3 m-10 relative">
                    <div><label class="text-sm text-gray-600">House Name:</label>
                        <div class="bg-gray-200 px-3 py-2 rounded-md">${address.housename}</div>
                    </div>
                    <div><label class="text-sm text-gray-600">City:</label>
                        <div class="bg-gray-200 px-3 py-2 rounded-md">${address.city}</div>
                    </div>
                    <div><label class="text-sm text-gray-600">Street:</label>
                        <div class="bg-gray-200 px-3 py-2 rounded-md">${address.street}</div>
                    </div>
                    <div class="flex space-x-4">
                        <div><label class="text-sm text-gray-600">State:</label>
                            <div class="bg-gray-200 px-3 py-2 rounded-md">${address.state}</div>
                        </div>
                        <div><label class="text-sm text-gray-600">Pin:</label>
                            <div class="bg-gray-200 px-3 py-2 rounded-md">${address.postalCode}</div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-6 mt-4">
                        <span class="ml-2">${address.label}</span>
                    </div>
                </div>
            `;
        });
    }

orders.forEach(order => {
                confirmationContainer.innerHTML += `
            <div class="flex justify-between items-center mt-14">
                <h3 class="text-lg font-semibold text-gray-800">Order: ${order.orderId}</h3>
                <span class="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full">${order.orderStatus}</span>
            </div>
            <div class="text-sm text-gray-600 space-y-1">
                <p><strong>Total:</strong> ₹${order.totalAmount}</p>
                <p><strong>Payment:</strong> ${order.paymentMethod}</p>
            </div>
        `;
});
}
