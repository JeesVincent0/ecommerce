function referralCouponList() {
    //hide other section
    accessDashBoardSection();
    hideUserSection();
    hideCategoryList();
    hideEditCategorySection();
    hideAddCategorySection();
    hideProductList();
    accessCouponSection()
    accessSalesReportSection()

    const orderSection = document.getElementById("orderSection");
    orderSection.classList.add("hidden");

    //changing side button color
    hideCategoryButton();
    hideUserButton();
    hideOrderButton();
    hideProductButton();

    // Get first page of coupons by default
    getReferralCoupon(1);
}

function getReferralCoupon(page = 1) {

    const limit = 6;
    fetch(`/coupon/referral?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                renderReferralCouponTable(data.coupons, data.pagination);
            }
        })
        .catch(error => {
            console.error("Error fetching coupons:", error);
        });
}

function renderReferralCouponTable(coupons, pagination) {
    const referralCouponList = accessReferralCouponSection();
    referralCouponList.innerHTML = `
    <div class="ml-[20%] mt-16 p-4 pl-10"><h2 class="text-2xl font-bold mb-4">Referral Coupon List</h2></div>
    <div class="ml-[22%] mr-[2%]" id="couponList">
            <div class="flex justify-between items-center">
                <div>
                    <input id="searchInputCoupon" type="text" placeholder="Search..." oninput="toggleClearButtonReferralCoupon()"
                        class="bg-gray-200 px-3 py-1 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8" />

                    <!-- Clear Button -->
                    <button id="clearSearchButtonCoupon" onclick="clearSearchReferralCoupon()"
                        class="absolute right-28 text-gray-500 hover:text-gray-700 hidden" style="font-size: 18px;">
                        &times;
                    </button>

                    <button onclick="referralCouponSearch()"
                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm">
                        Search
                    </button>
                </div>
                <button onclick="createReferralCoupon()" type="button"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm">
                    Add Coupon
                </button>
            </div>
            <table class="mt-10 min-w-full bg-white rounded shadow">
                <thead>
                    <tr class="bg-gray-200 text-gray-600 text-sm leading-normal">
                        <th class="py-3 px-6 text-left cursor-pointer" onclick="sortTable1(0)">Code ⬍</th>
                        <th class="py-3 px-6 text-left cursor-pointer" onclick="sortTable1(1)">Disc. Type ⬍</th>
                        <th class="py-3 px-6 text-left cursor-pointer" onclick="sortTable1(2)">Offer Days⬍</th>
                        <th class="py-3 px-6 text-left">Min. Purch</th>
                        <th class="py-3 px-6 text-left">Max. Disc</th>
                        <th class="py-3 px-6 text-left">Total Coupon</th>
                        <th class="py-3 px-6 text-left">Coupon Used</th>
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
                        onclick="getReferralCoupon(${pagination.currentPage - 1})" 
                        class="px-3 py-1 rounded ${pagination.hasPrevPage ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}"
                        ${pagination.hasPrevPage ? '' : 'disabled'}>
                        Previous
                    </button>
                    <div class="flex space-x-1">
                        ${paginationButtons(pagination)}
                    </div>
                    <button 
                        onclick="getReferralCoupon(${pagination.currentPage + 1})" 
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
            <td class="px-6 py-4">${coupon.offerDays}</td>
            <td class="px-6 py-4">${coupon.minPurchase}</td>
            <td class="px-6 py-4">${coupon.maxDiscount}</td>
            <td class="px-6 py-4">${coupon.totalUsageLimit}</td>
            <td class="px-6 py-4">${coupon.usedCount || 0}</td>
            <td class="px-6 py-4">${coupon.status}</td>
            <td class="px-6 py-4">
                <div class="flex gap-2">
                    <button 
                        class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded" 
                        onclick="editReferralCoupon('${coupon._id}')">
                        Edit
                    </button>
                    <button 
                        class="${coupon.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white text-sm px-3 py-1 rounded" 
                        onclick="blockReferralCoupon('${coupon._id}')">
                        ${coupon.status === 'active' ? 'Block' : 'Unblock'}
                    </button>
                </div>
            </td>
        `;
        
        couponTableBody.appendChild(row);
    });
}

function paginationButtons(pagination) {
    let buttons = '';
    const currentPage = pagination.currentPage;
    const totalPages = pagination.totalPages;
    
    // Always show first page
    buttons += `<button onclick="getReferralCoupon(1)" class="px-3 py-1 rounded ${currentPage === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">1</button>`;
    
    // If there are many pages, use ellipsis
    if (totalPages > 7) {
        if (currentPage > 3) {
            buttons += `<span class="px-2 py-1">...</span>`;
        }
        
        // Show pages around current page
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = startPage; i <= endPage; i++) {
            buttons += `<button onclick="getReferralCoupon(${i})" class="px-3 py-1 rounded ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">${i}</button>`;
        }
        
        if (currentPage < totalPages - 2) {
            buttons += `<span class="px-2 py-1">...</span>`;
        }
        
        // Always show last page if not already included
        if (totalPages > 1) {
            buttons += `<button onclick="getReferralCoupon(${totalPages})" class="px-3 py-1 rounded ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">${totalPages}</button>`;
        }
    } else {
        // Show all pages if there aren't many
        for (let i = 2; i <= totalPages; i++) {
            buttons += `<button onclick="getReferralCoupon(${i})" class="px-3 py-1 rounded ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">${i}</button>`;
        }
    }
    
    return buttons;
}

function toggleClearButtonReferralCoupon() {
    const searchInput = document.getElementById('searchInputCoupon');
    const clearButton = document.getElementById('clearSearchButtonCoupon');
    
    if (searchInput.value) {
        clearButton.classList.remove('hidden');
    } else {
        clearButton.classList.add('hidden');
    }
}

function clearSearchReferralCoupon() {
    const searchInput = document.getElementById('searchInputCoupon');
    searchInput.value = '';
    toggleClearButtonReferralCoupon();
    getReferralCoupon(1); // Reset to first page with no search
}

function referralCouponSearch() {
    const searchQuery = document.getElementById('searchInputCoupon').value.trim();
    
    if (!searchQuery) {
        getReferralCoupon(1);
        return;
    }
    
    fetch(`/coupon/referral/search?query=${encodeURIComponent(searchQuery)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // For search results, we don't use pagination
            renderReferralCouponTable(data.coupons, {
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

// The remaining functions stay the same as they don't interact with pagination
function createReferralCoupon() {
    const referralCouponList = accessReferralCouponSection();
    referralCouponList.innerHTML = `
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
            <select name="discountType" onchange="handleDiscountTypeReferralChange(this)"
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
            <label class="block text-sm font-medium text-gray-700">Offer Days</label>
            <input type="number" name="offerDays"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Maximum Offer Days after coupon eligible" required>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Total Coupons</label>
            <input type="number" name="totalUsageLimit"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Total coupon" required>
        </div>

        <button type="button" onclick="saveReferralCoupon()"
            class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Add Coupon
        </button>

    </form>
    </div>
    `;
}

function handleDiscountTypeReferralChange(select) {
    const maxDiscountInput = document.querySelector('input[name="maxDiscount"]');

    if (select.value === 'percentage') {
        maxDiscountInput.removeAttribute('disabled');
        maxDiscountInput.classList.remove('bg-gray-200');
    } else {
        maxDiscountInput.value = '';
        maxDiscountInput.setAttribute('disabled', true);
        maxDiscountInput.classList.add('bg-gray-200');
    }
}

function saveReferralCoupon() {
    const form = document.getElementById("addCouponForm");
    const formData = new FormData(form);

    fetch("/coupon/referral/add", {
        method: "POST",
        body: formData
    })
    .then((res) => res.json())
    .then((data) => {
        if(data.success) {
            referralCouponList();
        } else if(!data.success && data.couponUsed) {
            const codeLabel = document.getElementById("codeLabel");
            codeLabel.innerText = "Coupon Code already used, use another code";
            codeLabel.style.color = "red";
        }
    })
    .catch(error => {
        console.error("Error saving coupon:", error);
    });
}

function editReferralCoupon(couponId) {
    fetch(`/coupon/referral/edit/?couponId=${couponId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then((res) => res.json())
    .then((data) => {
        if(data.success) {
            renderReferralCouponEditForm(data.coupon);
        }
    })
    .catch(error => {
        console.error("Error fetching coupon for edit:", error);
    });
}

function renderReferralCouponEditForm(coupon) {
    const referralCouponList = accessReferralCouponSection();
    referralCouponList.innerHTML = `
    <div class="ml-[20%] mt-16 p-4 pl-10"><h2 class="text-2xl font-bold mb-4">Edit Coupon</h2></div>
    <div class="ml-[22%] mr-[2%] mb-[2%]" id="couponForm">
    <form id="editReferralCouponForm" class="space-y-4">

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
            <select name="discountType" onchange="handleDiscountTypeReferralChange(this)"
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
            <label class="block text-sm font-medium text-gray-700">Offer Days</label>
            <input 
                type="number" 
                name="offerDay"
                class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                required
                value="${coupon.offerDays}">
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Total Coupons</label>
            <input type="number" name="totalUsageLimit"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value="${coupon.totalUsageLimit}" required>
        </div>

        <div class="flex space-x-4">
            <button type="button" onclick="saveEditedReferralCoupon()"
                class="w-3/4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Save Coupon
            </button>
            
            <button type="button" onclick="referralCouponList()"
                class="w-1/4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                Cancel
            </button>
        </div>

    </form>
    </div>
    `;
}

function saveEditedReferralCoupon() {
    const form = document.getElementById("editReferralCouponForm");
    const formData = new FormData(form);

    fetch("/coupon/referral/edit", {
        method: "PATCH",
        body: formData
    })
    .then((res) => res.json())
    .then((data) => {
        if(data.success) {
            referralCouponList();
        }
    })
    .catch(error => {
        console.error("Error saving edited coupon:", error);
    });
}

function blockReferralCoupon(couponId) {
    fetch("/coupon/referral/block", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId })
    })
    .then(res => res.json())
    .then((data) => {
        if(data.success) {
            referralCouponList();
        }
    })
    .catch(error => {
        console.error("Error blocking/unblocking coupon:", error);
    });
}