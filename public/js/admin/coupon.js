function couponList() {
    //hide other section
    hideUserSection();
    hideCategoryList();
    hideEditCategorySection();
    hideAddCategorySection();
    hideProductList();
    accessSalesReportSection();
    accessDashBoardSection();

    const orderSection = document.getElementById("orderSection");
    orderSection.classList.add("hidden");

    //changing side button color
    hideCategoryButton();
    hideUserButton();
    hideOrderButton();
    hideProductButton();

    // Get first page of coupons by default
    getCoupon(1);
}

function getCoupon(page = 1) {
    const limit = 6;

    fetch(`/coupon?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                renderCouponTable(data.coupons, data.pagination);
            }
        })
        .catch(error => {
            console.error("Error fetching coupons:", error);
        });
}

function renderCouponTable(coupons, pagination) {
    const couponSection = accessCouponSection();
    couponSection.innerHTML = `
    <div class="ml-[20%] mt-16 p-4 pl-10"><h2 class="text-2xl font-bold mb-4">Coupon List</h2></div>
    <div class="ml-[20.4%] mr-[10%]" id="couponList">
            <div class="flex justify-between items-center">
                <div>
                    <input id="searchInputCoupon" type="text" placeholder="Search..." oninput="toggleClearButtonCoupon()"
                        class="bg-gray-200 px-3 py-1 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8" />

                    <!-- Clear Button -->
                    <button id="clearSearchButtonCoupon" onclick="clearSearchCoupon()"
                        class="absolute right-28 text-gray-500 hover:text-gray-700 hidden" style="font-size: 18px;">
                        &times;
                    </button>

                    <button onclick="couponSearch()"
                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm">
                        Search
                    </button>
                </div>
                <button onclick="createCoupon()" type="button"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm">
                    Add Coupon
                </button>
            </div>
            <table class="mt-10 min-w-full bg-white rounded shadow">
                <thead>
                    <tr class="bg-gray-200 text-gray-600 text-sm leading-normal">
                        <th class="py-3 px-6 text-left cursor-pointer" onclick="sortTable1(0)">Code ⬍</th>
                        <th class="py-3 px-6 text-left cursor-pointer" onclick="sortTable1(1)">Disc. Type ⬍</th>
                        <th class="py-3 px-6 text-left cursor-pointer" onclick="sortTable1(2)">Start Date ⬍</th>
                        <th class="py-3 px-6 text-left">End Date</th>
                        <th class="py-3 px-6 text-left">Min. Purch</th>
                        <th class="py-3 px-6 text-left">Max. Disc</th>
                        <th class="py-3 px-6 text-left">Total Coupon</th>
                        <th class="py-3 px-6 text-left">Coupon Used</th>
                        <th class="py-3 px-6 text-left">Usage Limit</th>
                        <th class="py-3 px-6 text-left">Status</th>
                        <th class="py-3 px-6 text-left">Action</th>
                    </tr>
                </thead>
                <tbody id="couponTableBody" class="text-gray-700 text-sm">
                    <!-- Dynamic rows will be inserted here -->
                </tbody>
            </table>
            <!-- Pagination Controls -->
            <div class="flex items-center justify-between mt-4">
                <div class="text-sm text-gray-600">
                    Showing ${((pagination.currentPage - 1) * 10) + 1} to ${Math.min(pagination.currentPage * 10, pagination.totalCoupons)} of ${pagination.totalCoupons} entries
                </div>
                <div class="flex space-x-2">
                    <button 
                        onclick="getCoupon(${pagination.currentPage - 1})" 
                        class="px-3 py-1 rounded ${pagination.hasPrevPage ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}"
                        ${pagination.hasPrevPage ? '' : 'disabled'}>
                        Previous
                    </button>
                    <div class="flex space-x-1">
                        ${generatePaginationButtons(pagination)}
                    </div>
                    <button 
                        onclick="getCoupon(${pagination.currentPage + 1})" 
                        class="px-3 py-1 rounded ${pagination.hasNextPage ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}"
                        ${pagination.hasNextPage ? '' : 'disabled'}>
                        Next
                    </button>
                </div>
            </div>
    </div>`;

    const couponTableBody = document.getElementById("couponTableBody");
    couponTableBody.innerHTML = "";

    coupons.forEach(coupon => {
        const row = document.createElement("tr");
        row.className = "border-b border-gray-200 hover:bg-gray-100";

        row.innerHTML = `
            <td class="px-6 py-4">${coupon.code}</td>
            <td class="px-6 py-4">${coupon.discountType}</td>
            <td class="px-6 py-4">${new Date(coupon.startDate).toLocaleDateString()}</td>
            <td class="px-6 py-4">${new Date(coupon.expiryDate).toLocaleDateString()}</td>
            <td class="px-6 py-4">${coupon.minPurchase}</td>
            <td class="px-6 py-4">${coupon.maxDiscount}</td>
            <td class="px-6 py-4">${coupon.totalUsageLimit}</td>
            <td class="px-6 py-4">${coupon.usedCount || 0}</td>
            <td class="px-6 py-4">${coupon.usageLimitPerUser}</td>
            <td class="px-6 py-4">${coupon.status}</td>
            <td class="px-6 py-4">
                <div class="flex gap-2">
                    <button 
                        class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded" 
                        onclick="editCoupon('${coupon._id}')">
                        Edit
                    </button>
                    <button 
                        class="${coupon.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white text-sm px-3 py-1 rounded" 
                        onclick="blockCoupon('${coupon._id}')">
                        ${coupon.status === 'active' ? 'Block' : 'Unblock'}
                    </button>
                </div>
            </td>
        `;

        couponTableBody.appendChild(row);
    });
}

function generatePaginationButtons(pagination) {
    let buttons = '';
    const currentPage = pagination.currentPage;
    const totalPages = pagination.totalPages;

    // Always show first page
    buttons += `<button onclick="getCoupon(1)" class="px-3 py-1 rounded ${currentPage === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">1</button>`;

    // If there are many pages, use ellipsis
    if (totalPages > 7) {
        if (currentPage > 3) {
            buttons += `<span class="px-2 py-1">...</span>`;
        }

        // Show pages around current page
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            buttons += `<button onclick="getCoupon(${i})" class="px-3 py-1 rounded ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">${i}</button>`;
        }

        if (currentPage < totalPages - 2) {
            buttons += `<span class="px-2 py-1">...</span>`;
        }

        // Always show last page if not already included
        if (totalPages > 1) {
            buttons += `<button onclick="getCoupon(${totalPages})" class="px-3 py-1 rounded ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">${totalPages}</button>`;
        }
    } else {
        // Show all pages if there aren't many
        for (let i = 2; i <= totalPages; i++) {
            buttons += `<button onclick="getCoupon(${i})" class="px-3 py-1 rounded ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">${i}</button>`;
        }
    }

    return buttons;
}

// Add these utility functions for search functionality
function toggleClearButtonCoupon() {
    const searchInput = document.getElementById('searchInputCoupon');
    const clearButton = document.getElementById('clearSearchButtonCoupon');

    if (searchInput.value) {
        clearButton.classList.remove('hidden');
    } else {
        clearButton.classList.add('hidden');
    }
}

function clearSearchCoupon() {
    const searchInput = document.getElementById('searchInputCoupon');
    searchInput.value = '';
    toggleClearButtonCoupon();
    getCoupon(1); // Reset to first page with no search
}

function couponSearch() {
    const searchQuery = document.getElementById('searchInputCoupon').value.trim();

    if (!searchQuery) {
        getCoupon(1);
        return;
    }

    fetch(`/coupon/search?query=${encodeURIComponent(searchQuery)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // For search results, we don't use pagination
                renderCouponTable(data.coupons, {
                    totalCoupons: data.coupons.length,
                    totalPages: 1,
                    currentPage: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                });
            }
        })
        .catch(error => {
            console.error("Error searching coupons:", error);
        });
}

// Date validation functions
function validateCouponDates(startDate, expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    const start = new Date(startDate);
    const expiry = new Date(expiryDate);

    // Check if start date is in the future
    if (start > today) {
        return {
            isValid: false,
            message: "Start date cannot be a future date"
        };
    }

    // Check if expiry date is before start date
    if (expiry <= start) {
        return {
            isValid: false,
            message: "End date must be after start date"
        };
    }

    return {
        isValid: true,
        message: ""
    };
}

function showValidationError(fieldName, message) {
    // Remove any existing error messages
    clearValidationErrors();

    // Find the field and add error styling
    const field = document.querySelector(`input[name="${fieldName}"]`);
    const label = field.previousElementSibling;

    // Add error styling to field
    field.classList.add('border-red-500', 'focus:ring-red-500');
    field.classList.remove('focus:ring-blue-500');

    // Create and show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1 validation-error';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);

    // Optionally change label color
    if (label) {
        label.classList.add('text-red-500');
    }
}

function clearValidationErrors() {
    // Remove all error messages
    const errorElements = document.querySelectorAll('.validation-error');
    errorElements.forEach(element => element.remove());

    // Reset field styling
    const fields = document.querySelectorAll('input[name="startDate"], input[name="expiryDate"]');
    fields.forEach(field => {
        field.classList.remove('border-red-500', 'focus:ring-red-500');
        field.classList.add('focus:ring-blue-500');

        const label = field.previousElementSibling;
        if (label) {
            label.classList.remove('text-red-500');
        }
    });
}

// Add real-time validation on date input change
function addDateInputListeners() {
    const startDateInput = document.querySelector('input[name="startDate"]');
    const expiryDateInput = document.querySelector('input[name="expiryDate"]');

    if (startDateInput && expiryDateInput) {
        startDateInput.addEventListener('change', function () {
            clearValidationErrors();
            if (this.value && expiryDateInput.value) {
                const validation = validateCouponDates(this.value, expiryDateInput.value);
                if (!validation.isValid) {
                    if (validation.message.includes("Start date")) {
                        showValidationError('startDate', validation.message);
                    } else if (validation.message.includes("End date")) {
                        showValidationError('expiryDate', validation.message);
                    }
                }
            }
        });

        expiryDateInput.addEventListener('change', function () {
            clearValidationErrors();
            if (startDateInput.value && this.value) {
                const validation = validateCouponDates(startDateInput.value, this.value);
                if (!validation.isValid) {
                    if (validation.message.includes("Start date")) {
                        showValidationError('startDate', validation.message);
                    } else if (validation.message.includes("End date")) {
                        showValidationError('expiryDate', validation.message);
                    }
                }
            }
        });
    }
}

function createCoupon() {
    const couponSection = accessCouponSection();
    couponSection.innerHTML = `
    <div class="ml-[20%] mt-16 p-4 pl-10"><h2 class="text-2xl font-bold mb-4">Create new Coupon</h2></div>
    <div class="ml-[22%] mr-[2%] mb-[2%]" id="couponForm">
    <form id="addCouponForm" class="space-y-4">
  
        <div>
            <label class="block text-sm font-medium text-gray-700" id="codeLabel">Coupon Code</label>
            <input type="text" name="code"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Coupon Code" required>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Discount Type</label>
            <select name="discountType" onchange="handleDiscountTypeChange(this)"
            class="mt-2 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Select Type</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
            </select>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Discount Value</label>
            <input type="number" name="discountValue"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 10 for 10% or ₹100" required>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Minimum Purchase (₹)</label>
            <input type="number" name="minPurchase"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Minimum cart value to apply coupon">
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Maximum Discount Limit (₹)</label>
            <input type="number" name="maxDiscount"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
            placeholder="Max discount allowed (only for % type)">
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Start Date</label>
            <input type="date" name="startDate" id="startDate1"
                class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <p id="startDateError1" class="text-red-500 text-sm mt-1 hidden"></p>
        </div>

        <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input type="date" name="expiryDate" id="expiryDate1"
                class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <p id="expiryDateError1" class="text-red-500 text-sm mt-1 hidden"></p>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Total Coupons</label>
            <input type="number" name="totalUsageLimit"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Total coupon" required>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Usage Limit Per User</label>
            <input type="number" name="usageLimitPerUser"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How many times a user can use this coupon" required>
        </div>

        <button type="button" onclick="saveCoupon()"
            class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Add Coupon
        </button>

    </form>
    </div>
    `;

    // Add date input listeners after form is rendered
    setTimeout(() => addDateInputListeners(), 100);
}

const startDateInput = document.getElementById('startDate1');
const expiryDateInput = document.getElementById('expiryDate1');
const startDateError = document.getElementById('startDateError1');
const expiryDateError = document.getElementById('expiryDateError1');

function validateDates() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(startDateInput.value);
    const expiryDate = new Date(expiryDateInput.value);

    let startValid = true;
    let expiryValid = true;

    // Reset error messages
    startDateError.classList.add('hidden');
    expiryDateError.classList.add('hidden');

    // Start date should not be in the future
    if (startDateInput.value && startDate > today) {
        startDateError.textContent = 'Start date cannot be in the future.';
        startDateError.classList.remove('hidden');
        startValid = false;
    }

    // Expiry date should not be before start date
    if (startDateInput.value && expiryDateInput.value && expiryDate < startDate) {
        expiryDateError.textContent = 'Expiry date cannot be before start date.';
        expiryDateError.classList.remove('hidden');
        expiryValid = false;
    }

    return startValid && expiryValid;
}

startDateInput.addEventListener('change', validateDates);
expiryDateInput.addEventListener('change', validateDates);

function handleDiscountTypeChange(select) {
    const maxDiscountInput = document.querySelector('input[name="maxDiscount"]');

    if (select.value === 'percentage') {
        maxDiscountInput.removeAttribute('disabled');
        maxDiscountInput.classList.remove('bg-gray-200');
    } else {
        maxDiscountInput.setAttribute('disabled', true);
        maxDiscountInput.classList.add('bg-gray-200');
        maxDiscountInput.value = '';
    }
}

function saveCoupon() {
    const form = document.getElementById("addCouponForm");
    const formData = new FormData(form);

    const startDate = formData.get('startDate');
    const expiryDate = formData.get('expiryDate');

    // Clear previous validation errors
    clearValidationErrors();

    // Validate dates
    const validation = validateCouponDates(startDate, expiryDate);

    if (!validation.isValid) {
        // Determine which field to highlight based on the error
        if (validation.message.includes("Start date")) {
            showValidationError('startDate', validation.message);
        } else if (validation.message.includes("End date")) {
            showValidationError('expiryDate', validation.message);
        }
        return; // Stop form submission
    }

    fetch("/coupon/add", {
        method: "POST",
        body: formData
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                couponList();
            } else if (!data.success && data.couponUsed) {
                const codeLabel = document.getElementById("codeLabel");
                codeLabel.innerText = "Coupon Code already used, use another code";
                codeLabel.style.color = "red";
            }
        })
        .catch(error => {
            console.error("Error saving coupon:", error);
        });
}

function editCoupon(couponId) {
    fetch(`/coupon/edit/?couponId=${couponId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                renderCouponEditForm(data.coupon);
            }
        })
        .catch(error => {
            console.error("Error fetching coupon for edit:", error);
        });
}

function renderCouponEditForm(coupon) {
    const couponSection = accessCouponSection();
    couponSection.innerHTML = `
    <div class="ml-[20%] mt-16 p-4 pl-10"><h2 class="text-2xl font-bold mb-4">Edit Coupon</h2></div>
    <div class="ml-[22%] mr-[2%] mb-[2%]" id="couponForm">
    <form id="editCouponForm" class="space-y-4">

        <div class="hidden">
            <input type="text" name="id" value="${coupon._id}">
        </div>

  
        <div>
            <label class="block text-sm font-medium text-gray-700" id="codeLabel">Coupon Code</label>
            <input type="text" name="code"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value="${coupon.code}" required>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Discount Type</label>
            <select name="discountType" onchange="handleDiscountTypeChange(this)"
            class="mt-2 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="${coupon.discountType}">${coupon.discountType}</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
            </select>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Discount Value</label>
            <input type="number" name="discountValue"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value="${coupon.discountValue}" required>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Minimum Purchase (₹)</label>
            <input type="number" name="minPurchase"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value="${coupon.minPurchase}">
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Maximum Discount Limit (₹)</label>
            <input type="number" name="maxDiscount"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            ${coupon.discountType !== 'percentage' ? 'disabled' : ''}
            value="${coupon.maxDiscount}">
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Start Date</label>
            <input 
                type="date" 
                name="startDate"
                class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                required
                value="${new Date(coupon.startDate).toISOString().split('T')[0]}">
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input 
                type="date" 
                name="expiryDate"
                class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                required
                value="${new Date(coupon.expiryDate).toISOString().split('T')[0]}">
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Total Coupons</label>
            <input type="number" name="totalUsageLimit"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value="${coupon.totalUsageLimit}" required>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Usage Limit Per User</label>
            <input type="number" name="usageLimitPerUser"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value="${coupon.usageLimitPerUser}" required>
        </div>

        <div class="flex space-x-4">
            <button type="button" onclick="saveEditedCoupon()"
                class="w-3/4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Save Coupon
            </button>
            
            <button type="button" onclick="couponList()"
                class="w-1/4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                Cancel
            </button>
        </div>

    </form>
    </div>
    `;

    // Add date input listeners after form is rendered
    setTimeout(() => addDateInputListeners(), 100);
}

function saveEditedCoupon() {
    const form = document.getElementById("editCouponForm");
    const formData = new FormData(form);

    const startDate = formData.get('startDate');
    const expiryDate = formData.get('expiryDate');

    // Clear previous validation errors
    clearValidationErrors();

    // Validate dates
    const validation = validateCouponDates(startDate, expiryDate);

    if (!validation.isValid) {
        // Determine which field to highlight based on the error
        if (validation.message.includes("Start date")) {
            showValidationError('startDate', validation.message);
        } else if (validation.message.includes("End date")) {
            showValidationError('expiryDate', validation.message);
        }
        return; // Stop form submission
    }

    fetch("/coupon/edit", {
        method: "PATCH",
        body: formData
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                couponList();
            }
        })
        .catch(error => {
            console.error("Error saving edited coupon:", error);
        });
}

function blockCoupon(couponId) {
    fetch("/coupon/block", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId })
    })
        .then(res => res.json())
        .then((data) => {
            if (data.success) {
                couponList();
            }
        })
        .catch(error => {
            console.error("Error blocking/unblocking coupon:", error);
        });
}