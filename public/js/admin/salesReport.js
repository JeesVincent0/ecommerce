function salesReport() {
    //hide other sections
    hideUserSection();
    hideCategoryList();
    hideEditCategorySection();
    hideAddCategorySection();
    hideProductList();
    accessCouponSection();
    accessReferralCouponSection();

    const orderSection = document.getElementById("orderSection");
    orderSection.classList.add("hidden");

    //changing side button color
    hideCategoryButton();
    hideUserButton();
    hideOrderButton();
    hideProductButton();
    renderSalesReport();


    // Get first page of sales report by default
    getSalesReport(1);
}

function getSalesReport(page = 1) {
    const limit = 5;

    // Get date filter values
    const startDate = document.getElementById('startDateFilter')?.value || '';
    const endDate = document.getElementById('endDateFilter')?.value || '';

    // Build query parameters
    let queryParams = `page=${page}&limit=${limit}`;
    if (startDate) queryParams += `&startDate=${startDate}`;
    if (endDate) queryParams += `&endDate=${endDate}`;

    console.log('Date sample - ', endDate)

    fetch(`/salesreport?${queryParams}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                console.log(data.summary)
                renderSalesTable(data.orders, data.summary, data.pagination)
            }
        })
        .catch(error => {
            console.error("Error fetching sales report:", error);
        });
}

function renderSalesReport() {
    const referralCouponList = accessSalesReportSection();
    referralCouponList.innerHTML = `
    <div class="ml-[20%] mt-16 p-4 pl-10">
        <h2 class="text-2xl font-bold mb-4">Sales Report</h2>
    </div>
    
    <!-- Date Filter Section -->
    <div class="ml-[22%] mr-[2%] mb-6">
    <div class="bg-white/90 backdrop-blur-sm p-6 rounded shadow-md border border-gray-100/50">
        <div class="flex items-center gap-6 flex-wrap">
            <!-- Date Range Inputs -->
            <div class="flex items-center gap-3 bg-gray-50/80 px-4 py-3 rounded-xl">
                <div class="flex items-center gap-2">
                    <label for="startDateFilter" class="text-sm font-semibold text-gray-800">From:</label>
                    <input 
                        type="date" 
                        id="startDateFilter" 
                        class="px-4 py-2 border-0 bg-white/80 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all duration-200 shadow-sm"
                        onchange="handleDateFilter()"
                    />
                </div>
                <div class="w-px h-8 bg-gray-200"></div>
                <div class="flex items-center gap-2">
                    <label for="endDateFilter" class="text-sm font-semibold text-gray-800">To:</label>
                    <input 
                        type="date" 
                        id="endDateFilter" 
                        class="px-4 py-2 border-0 bg-white/80 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all duration-200 shadow-sm"
                        onchange="handleDateFilter()"
                    />
                </div>
            </div>

            <!-- Filter Actions -->
            <div class="flex gap-3">
                <button 
                    onclick="applyDateFilter()" 
                    class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-3 focus:ring-blue-500/30 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                    Apply Filter
                </button>
                <button 
                    onclick="clearDateFilter()" 
                    class="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-3 focus:ring-gray-500/30 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                    Clear Filter
                </button>
            </div>

            <!-- Quick Date Filters -->
            <div class="flex gap-2">
                <button 
                    onclick="setTodayFilter()" 
                    class="rounded px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-3 focus:ring-blue-500/30 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                >
                    Today
                </button>
                <button 
                    onclick="setLast7DaysFilter()" 
                    class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-3 focus:ring-blue-500/30 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                >
                    Last 7 Days
                </button>
                <button 
                    onclick="setLast3MonthsFilter()" 
                    class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-3 focus:ring-blue-500/30 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                >
                    Last 3 Months
                </button>
            </div>

            <!-- Download Actions -->
            <div class="flex gap-3 ml-auto">
                <button 
                    onclick="getExcel()" 
                    class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-3 focus:ring-green-500/30 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                    EXCEL
                </button>
                <button 
                    onclick="getPdf()" 
                    class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-3 focus:ring-red-500/30 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                    PDF
                </button>
            </div>
        </div>
        
        <div id="dateFilterStatus" class="mt-4 text-sm text-gray-600 bg-blue-50/50 px-4 py-2 rounded-lg border-l-4 border-blue-400"></div>
    </div>
</div>


    <div id="salesTable"> </div>`;


    // Update date filter status
    updateDateFilterStatus();

}

function renderSalesTable(orders, summary, pagination) {
    const salesTable = document.getElementById("salesTable");
    salesTable.innerHTML = "";
    salesTable.innerHTML = `
    <div class="ml-[22%] mr-[2%]" id="couponList">
        <table class="mt-4 min-w-full bg-white rounded shadow">
            <thead>
                <tr class="bg-gray-200 text-gray-600 text-sm leading-normal">
                <th class="py-3 px-6 text-left">Order ID ⬍</th>
                    <th class="py-3 px-6 text-left">Customer ⬍</th>
                    <th class="py-3 px-6 text-left">Date ⬍</th>
                    <th class="py-3 px-6 text-left">Payment ⬍</th>
                    <th class="py-3 px-6 text-left">Items ⬍</th>
                    <th class="py-3 px-6 text-left">Total ₹ ⬍</th>
                    <th class="py-3 px-6 text-left">Offer ₹ ⬍</th>
                    <th class="py-3 px-6 text-left">Final ₹ ⬍</th>
                    <th class="py-3 px-6 text-left">Status</th>
                </tr>
            </thead>
            <tbody id="salesReportTableBody" class="text-gray-700 text-sm">
                <!-- Dynamic rows will be inserted here -->
            </tbody>
        </table>
        <!-- Pagination Controls -->
        <div class="flex items-center justify-between mt-4 mb-[3%]">
            <div class="text-sm text-gray-600">
               
            </div>
            <div class="flex space-x-2">
                <button 
                    onclick="getSalesReport(${pagination.currentPage - 1})" 
                    class="px-3 py-1 rounded ${pagination.hasPrevPage ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}"
                    ${pagination.hasPrevPage ? '' : 'disabled'}>
                    Previous
                </button>
                <div class="flex space-x-1">
                    ${paginationButtonsSalesReport(pagination)}
                </div>
                <button 
                    onclick="getSalesReport(${pagination.currentPage + 1})" 
                    class="px-3 py-1 rounded ${pagination.hasNextPage ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}"
                    ${pagination.hasNextPage ? '' : 'disabled'}>
                    Next
                </button>
            </div>
        </div>
    </div>`;
    const salesReportTableBody = document.getElementById("salesReportTableBody");
    salesReportTableBody.innerHTML = "";

    orders.forEach(order => {
        const row = document.createElement("tr");
        row.className = "border-b border-gray-200 hover:bg-gray-100";

        row.innerHTML = `
            <td class="px-6 py-4">${order.orderId}</td>
            <td class="px-6 py-4">${order.userName}</td>
            <td class="px-6 py-4">${new Date(order.placedAt).toLocaleDateString()}</td>
            <td class="px-6 py-4 capitalize">${order.paymentMethod}</td>
            <td class="px-6 py-4">${order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
            <td class="px-6 py-4">₹${order.totalAmount}</td>
            <td class="px-6 py-4 text-red-600">₹${order.coupon?.discountAmount || 0}</td>
            <td class="px-6 py-4 font-semibold">₹${order.grandTotal}</td>
            <td class="px-6 py-4 capitalize text-green-600">${order.orderStatus}</td>
            `;

        salesReportTableBody.appendChild(row);
    });

    // Add summary row
    const summaryRow = document.createElement("tr");
    summaryRow.className = "border-b-2 border-gray-300 bg-gray-50 font-semibold";

    summaryRow.innerHTML = `
        <td class="px-6 py-4"></td>
        <td class="px-6 py-4"></td>
        <td class="px-6 py-4"></td>
        <td class="px-6 py-4"></td>
        <td class="px-6 py-4 font-semibold">TOTAL</td>
        <td class="px-6 py-4">₹${summary.totalSales}</td>
        <td class="px-6 py-4 text-red-600">₹${summary?.totalDiscount || 0}</td>
        <td class="px-6 py-4 font-semibold">₹${summary.finalAmount}</td>
        <td class="px-6 py-4"></td>
    `;
    salesReportTableBody.appendChild(summaryRow);

}

function paginationButtonsSalesReport(pagination) {
    let buttons = '';
    const currentPage = pagination.currentPage;
    const totalPages = pagination.totalPages;

    // Always show first page
    buttons += `<button onclick="getSalesReport(1)" class="px-3 py-1 rounded ${currentPage === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">1</button>`;

    // If there are many pages, use ellipsis
    if (totalPages > 7) {
        if (currentPage > 3) {
            buttons += `<span class="px-2 py-1">...</span>`;
        }

        // Show pages around current page
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            buttons += `<button onclick="getSalesReport(${i})" class="px-3 py-1 rounded ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">${i}</button>`;
        }

        if (currentPage < totalPages - 2) {
            buttons += `<span class="px-2 py-1">...</span>`;
        }

        // Always show last page if not already included
        if (totalPages > 1) {
            buttons += `<button onclick="getSalesReport(${totalPages})" class="px-3 py-1 rounded ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">${totalPages}</button>`;
        }
    } else {
        // Show all pages if there aren't many
        for (let i = 2; i <= totalPages; i++) {
            buttons += `<button onclick="getSalesReport(${i})" class="px-3 py-1 rounded ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">${i}</button>`;
        }
    }

    return buttons;
}

// Date Filter Functions
function handleDateFilter() {
    const startDate = document.getElementById('startDateFilter').value;
    const endDate = document.getElementById('endDateFilter').value;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        alert('Start date cannot be later than end date');
        return;
    }

    updateDateFilterStatus();
}

function applyDateFilter() {
    const startDate = document.getElementById('startDateFilter').value;
    const endDate = document.getElementById('endDateFilter').value;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        alert('Start date cannot be later than end date');
        return;
    }

    // Reset to first page when applying filter
    getSalesReport(1);
}

function clearDateFilter() {
    document.getElementById('startDateFilter').value = '';
    document.getElementById('endDateFilter').value = '';
    updateDateFilterStatus();
    // Reset to first page with no filter
    getSalesReport(1);
}

function updateDateFilterStatus() {
    const startDate = document.getElementById('startDateFilter')?.value;
    const endDate = document.getElementById('endDateFilter')?.value;
    const statusElement = document.getElementById('dateFilterStatus');

    if (!statusElement) return;

    if (startDate || endDate) {
        let statusText = 'Filter active: ';
        if (startDate && endDate) {
            statusText += `From ${formatDate(startDate)} to ${formatDate(endDate)}`;
        } else if (startDate) {
            statusText += `From ${formatDate(startDate)} onwards`;
        } else if (endDate) {
            statusText += `Up to ${formatDate(endDate)}`;
        }
        statusElement.textContent = statusText;
        statusElement.className = 'mt-2 text-sm text-blue-600 font-medium';
    } else {
        statusElement.textContent = 'No date filter applied - showing all orders';
        statusElement.className = 'mt-2 text-sm text-gray-600';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getPdf() {

    const startDate = document.getElementById('startDateFilter')?.value || '';
    const endDate = document.getElementById('endDateFilter')?.value || '';

    // Build query parameters
    let queryParams;
    if (startDate) queryParams += `&startDate=${startDate}`;
    if (endDate) queryParams += `&endDate=${endDate}`;

    fetch(`/salesreport/pdf/download?${queryParams}`)
        .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch report");
            return res.blob();
        })
        .then((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "sales-report.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        })
        .catch((err) => {
            console.error("Error downloading report:", err);
        });
}

function getExcel() {

    const startDate = document.getElementById('startDateFilter')?.value || '';
    const endDate = document.getElementById('endDateFilter')?.value || '';

    // Build query parameters
    let queryParams;
    if (startDate) queryParams += `&startDate=${startDate}`;
    if (endDate) queryParams += `&endDate=${endDate}`;

    fetch(`/salesreport/excel/download?${queryParams}`)
        .then(res => {
            if (!res.ok) throw new Error("Failed to download");
            return res.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "sales-report.xlsx";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        })
        .catch(err => console.error("Download error:", err));
}

function setTodayFilter() {
    const startDate = document.getElementById('startDateFilter')
    const endDate = document.getElementById('endDateFilter')
    
    const today = new Date().toISOString().split('T')[0]
    
    startDate.value = today
    endDate.value = today

    getSalesReport()
}

function setLast3MonthsFilter() {
   const startDate = document.getElementById('startDateFilter')
   const endDate = document.getElementById('endDateFilter')
   
   const today = new Date()
   const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
   
   startDate.value = threeMonthsAgo.toISOString().split('T')[0]
   endDate.value = today.toISOString().split('T')[0]

   getSalesReport()
}

function setLast7DaysFilter() {
   const startDate = document.getElementById('startDateFilter')
   const endDate = document.getElementById('endDateFilter')
   
   const today = new Date()
   const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
   
   startDate.value = sevenDaysAgo.toISOString().split('T')[0]
   endDate.value = today.toISOString().split('T')[0]

   getSalesReport()
}