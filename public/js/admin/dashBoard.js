function dashBoard() {

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

    renderDashBoard();
    getDashBoardData();
}

function renderDashBoard() {

    const dashBoard = accessDashBoardSection();
    dashBoard.innerHTML = `
    <div class="ml-[20%] mt-16 p-4 pl-10 bg-gray-200">
    <div class="">
        <div class="text-center mb-16">
            <h1 class="text-5xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                Admin Dashboard
            </h1>
        </div>

        <!-- Filter Buttons -->
        <div class="bg-white/90 backdrop-blur-sm p-6 rounded shadow-md border border-gray-100/50 mb-5">
        <div class="flex items-center gap-6 flex-wrap">
            <!-- Date Range Inputs -->
            <div class="flex items-center gap-3 bg-gray-50/80 px-4 py-3 rounded-xl">
                <div class="flex items-center gap-2">
                    <label for="startDateFilter" class="text-sm font-semibold text-gray-800">From:</label>
                    <input 
                        type="date" 
                        id="dashStartDateFilter" 
                        class="px-4 py-2 border-0 bg-white/80 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all duration-200 shadow-sm"
                        onchange="handleDateFilterDash()"
                    />
                </div>
                <div class="w-px h-8 bg-gray-200"></div>
                <div class="flex items-center gap-2">
                    <label for="endDateFilter" class="text-sm font-semibold text-gray-800">To:</label>
                    <input 
                        type="date" 
                        id="dashEndDateFilter" 
                        class="px-4 py-2 border-0 bg-white/80 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all duration-200 shadow-sm"
                        onchange="handleDateFilterDash()"
                    />
                </div>
            </div>

            <!-- Filter Actions -->
            <div class="flex gap-3">
                <button 
                    onclick="applyDateDash()" 
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
                    onclick="todayDashFilter()" 
                    class="rounded px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-3 focus:ring-blue-500/30 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                >
                    Today
                </button>
                <button 
                    onclick="last7DaysFilter()" 
                    class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-3 focus:ring-blue-500/30 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                >
                    Last 7 Days
                </button>
                <button 
                    onclick="last3MonthsFilter()" 
                    class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-3 focus:ring-blue-500/30 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                >
                    Last 3 Months
                </button>
            </div>


        </div>
        
        <div id="dateFilterStatus" class="mt-4 text-sm text-gray-600 bg-blue-50/50 px-4 py-2 rounded-lg border-l-4 border-blue-400"></div>
    </div>
 
        <!-- Charts Section -->
        <div class="flex flex-wrap gap-8 justify-center mb-8">
            <!-- Card 1 -->
            <div class="group relative bg-white backdrop-blur-xl border border-gray-200 rounded-lg p-8 w-full sm:max-w-md lg:w-[30%] xl:w-[30%] hover:bg-gray-50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 shadow-lg">
                <div class="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-violet-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div class="relative z-10">
                    <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">Delivery & Return Ratio</h3>
                    <div class="flex justify-center">
                        <canvas id="sampleBar" width="280" height="280" class="drop-shadow-lg"></canvas>
                    </div>
                </div>
            </div>

            <!-- Card 2 -->
            <div class="group relative bg-white backdrop-blur-xl border border-gray-200 rounded-lg p-8 w-full sm:max-w-md lg:w-[30%] xl:w-[30%] hover:bg-gray-50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10 shadow-lg">
                <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div class="relative z-10">
                    <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">Payment Method Ratio</h3>
                    <div class="flex justify-center">
                        <canvas id="sampleBar2" width="280" height="280" class="drop-shadow-lg"></canvas>
                    </div>
                </div>
            </div>

            <!-- Card 3 -->
            <div class="group relative bg-white backdrop-blur-xl border border-gray-200 rounded-lg p-8 w-full sm:max-w-md lg:w-[30%] xl:w-[30%] hover:bg-gray-50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/10 shadow-lg">
                <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div class="relative z-10">
                    <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">Sales</h3>
                    <div class="flex justify-center">
                        <canvas id="sampleBar3" width="280" height="280" class="drop-shadow-lg"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sales chart -->
        <div class="w-full bg-white rounded-lg shadow-md mt-5">
            <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">Sales Performance</h1>
                <div class="relative h-96">
                    <canvas id="salesChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Products Table Section -->
        <div class="w-full bg-white rounded-lg shadow-md mt-5">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-2xl font-bold text-gray-800">Top 10 Selling Products</h2>
                <p class="text-gray-600 mt-1">Best performing products this month</p>
            </div>

            <!-- Scrollable Content -->
            <div class="h-96 overflow-y-auto custom-scrollbar">
                <div id="products-container" class="p-4 space-y-3">
                    <!-- Products will be loaded here by JavaScript -->
                </div>
            </div>
        </div>

        <div class="w-full bg-white rounded-lg shadow-md mt-5">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-2xl font-bold text-gray-800">Top 10 Categories</h2>
                <p class="text-gray-600 mt-1">Best performing categories this month</p>
            </div>

            <!-- Scrollable Content -->
            <div class="h-96 overflow-y-auto custom-scrollbar">
                <div id="categories-container" class="p-4 space-y-3">
                    <!-- Categories will be loaded here by JavaScript -->
                </div>
            </div>
        </div>

        <div class="w-full bg-white rounded-lg shadow-md mt-5">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-2xl font-bold text-gray-800">Top 10 Brands</h2>
                <p class="text-gray-600 mt-1">Best performing brands this month</p>
            </div>

            <!-- Scrollable Content -->
            <div class="h-96 overflow-y-auto custom-scrollbar">
                <div id="brands-container" class="p-4 space-y-3">
                    <!-- Brands will be loaded here by JavaScript -->
                </div>
            </div>
        </div>
    
        
    </div>

    </div>
</div>`


}

//fetch data to dashboard using date filter
function getDashBoardData() {

    //get filtering date from the form
    const startDate = document.getElementById('dashStartDateFilter')?.value || '';
    const endDate = document.getElementById('dashEndDateFilter')?.value || '';

    // Build query parameters
    let queryParams = '';
    console.log("Params - ", queryParams)
    if (startDate) queryParams += `startDate=${startDate}`;
    if (endDate) queryParams += `&endDate=${endDate}`;

    fetch(`/dashboard?${queryParams}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log("data from backend",data)
                getChartData(data)
                fetchSalesChartData()
            } else {
                console.log("Server responce failed")
            }
        })
        .catch(error => console.log(error))
}

// Date Filter Functions
function handleDateFilterDash() {
    const startDate = document.getElementById('dashStartDateFilter').value;
    const endDate = document.getElementById('dashEndDateFilter').value;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        alert('Start date cannot be later than end date');
        return;
    }

    updateDateFilterStatusDash();
}

function applyDateDash() {
    const startDate = document.getElementById('dashStartDateFilter').value;
    const endDate = document.getElementById('dashEndDateFilter').value;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        alert('Start date cannot be later than end date');
        return;
    }

    // Reset to first page when applying filter
    getDashBoardData()
}

function clearDateFilter() {
    document.getElementById('dashStartDateFilter').value = '';
    document.getElementById('dashEndDateFilter').value = '';
    updateDateFilterStatusDash();
    // Reset to first page with no filter
    getDashBoardData();
}

function updateDateFilterStatusDash() {
    const startDate = document.getElementById('dashStartDateFilter')?.value;
    const endDate = document.getElementById('dashEndDateFilter')?.value;
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

function todayDashFilter() {
    const startDate = document.getElementById('dashStartDateFilter')
    const endDate = document.getElementById('dashEndDateFilter')

    const today = new Date().toISOString().split('T')[0]

    startDate.value = today
    endDate.value = today

    getDashBoardData()
}

function last3MonthsFilter() {
    const startDate = document.getElementById('dashStartDateFilter')
    const endDate = document.getElementById('dashEndDateFilter')

    const today = new Date()
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())

    startDate.value = threeMonthsAgo.toISOString().split('T')[0]
    endDate.value = today.toISOString().split('T')[0]

    getDashBoardData()
}

function last7DaysFilter() {
    const startDate = document.getElementById('dashStartDateFilter')
    const endDate = document.getElementById('dashEndDateFilter')

    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    startDate.value = sevenDaysAgo.toISOString().split('T')[0]
    endDate.value = today.toISOString().split('T')[0]

    getDashBoardData()
}

let donutChart;
let donutChart2;
let donutChart3;

function getChartData(data) {
    const ctx = document.getElementById("sampleBar");
    const ctx1 = document.getElementById("sampleBar2");
    const ctx2 = document.getElementById("sampleBar3");

    // Method 1: Destroy existing charts before creating new ones
    if (donutChart) {
        donutChart.destroy();
    }

    if (donutChart2) {
        donutChart2.destroy();
    }

    if (donutChart3) {
        donutChart3.destroy();
    }

    donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [`Dleivered: ${data.deliveryReturnRatio.deliveredPercentage}%`, `Rturned: ${data.deliveryReturnRatio.returnedPercentage}%`],
            datasets: [{
                label: 'Ratio',
                data: [data.deliveryReturnRatio.deliveredPercentage, data.deliveryReturnRatio.returnedPercentage],
                backgroundColor: [
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                ],
                borderColor: [
                    'rgba(236, 72, 153, 1)',
                    'rgba(139, 92, 246, 1)',
                ],
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#374151',
                        padding: 10,
                        font: { size: 12 }
                    }
                }
            },
        }
    });

    donutChart2 = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: [`COD: ${data.paymentMethodRatio.codPercentage}%`, `Razorpay: ${data.paymentMethodRatio.razorpayPercentage}%`],
            datasets: [{
                label: 'Payment Type',
                data: [data.paymentMethodRatio.codPercentage, data.paymentMethodRatio.razorpayPercentage],
                backgroundColor: [
                    'rgba(6, 182, 212, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                ],
                borderColor: [
                    'rgba(6, 182, 212, 1)',
                    'rgba(34, 197, 94, 1)',
                ],
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#374151',
                        padding: 20,
                        font: { size: 12 }
                    }
                }
            },
        }
    });

    donutChart3 = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: [`MRP: ${data.pricingStats.totalMRP}/-`, `Offer: ${data.pricingStats.totalOffers}/-`,],
            datasets: [{
                label: 'Offers Ratio',
                data: [data.pricingStats.totalMRP, data.pricingStats.totalOffers],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(255,64,25, 0.8)',
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(255,64,25, 0.8)',
                ],
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#374151',
                        padding: 20,
                        font: { size: 12 }
                    }
                }
            },
        }
    });

    // Function to render star rating
    function renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="text-yellow-400">★</span>';
        }

        if (hasHalfStar) {
            stars += '<span class="text-yellow-400">☆</span>';
        }

        return stars;
    }

    // Function to load products
    function loadProducts() {
        console.log("loadProducts")
        const container = document.getElementById('products-container');

        data.topProducts.forEach((product, index) => {
            const productDiv = document.createElement('div');
            productDiv.className = 'flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200 cursor-pointer';

            productDiv.innerHTML = `
                    <!-- Rank Badge -->
                    <div class="flex-shrink-0 mr-4">
                        <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            ${index + 1}
                        </div>
                    </div>

                    <!-- Product Image -->
                    <div class="flex-shrink-0 mr-4">
                        <img
                            src="${product.image}"
                            alt="${product.product_name}"
                            class="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTI4IDI4TDM2IDM2IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo='"
                        />
                    </div>

                    <!-- Product Details -->
                    <div class="flex-grow min-w-0">
                        <h3 class="text-lg font-semibold text-gray-800 truncate mb-1">
                            ${product.product_name}
                        </h3>
                        <div class="flex items-center justify-between">
                            <div class="text-sm text-gray-600">
                                <span class="font-medium">${product.totalSold}</span> sold
                            </div>
                            <div class="text-right">
                                <div class="text-xl font-bold text-green-600">Rs.${product.mrp}</div>
                            </div>
                        </div>
                    </div>
                `;

            // Add click event listener
            productDiv.addEventListener('click', function () {
                alert(`Clicked on ${product.name} - $${product.price}`);
            });

            container.appendChild(productDiv);
        });
    }

    // Load products when page loads
    loadProducts();

    // Mock data for top 10 categories
    const categories = [
        {
            id: 1,
            name: "Electronics & Accessories",
            totalSales: 28500,
            revenue: 1250000,
            products: 145,
            icon: "💻",
            growth: 15.2,
            avgRating: 4.6
        },
        {
            id: 2,
            name: "Home & Garden",
            totalSales: 24800,
            revenue: 980000,
            products: 210,
            icon: "🏡",
            growth: 12.8,
            avgRating: 4.4
        },
        {
            id: 3,
            name: "Fashion & Clothing",
            totalSales: 22100,
            revenue: 890000,
            products: 320,
            icon: "👕",
            growth: 8.9,
            avgRating: 4.3
        },
        {
            id: 4,
            name: "Sports & Fitness",
            totalSales: 19600,
            revenue: 750000,
            products: 180,
            icon: "⚽",
            growth: 18.5,
            avgRating: 4.5
        },
        {
            id: 5,
            name: "Health & Beauty",
            totalSales: 18200,
            revenue: 680000,
            products: 155,
            icon: "💄",
            growth: 22.1,
            avgRating: 4.7
        },
        {
            id: 6,
            name: "Books & Media",
            totalSales: 16800,
            revenue: 420000,
            products: 890,
            icon: "📚",
            growth: 5.3,
            avgRating: 4.8
        },
        {
            id: 7,
            name: "Automotive",
            totalSales: 14500,
            revenue: 920000,
            products: 95,
            icon: "🚗",
            growth: 11.7,
            avgRating: 4.2
        },
        {
            id: 8,
            name: "Toys & Games",
            totalSales: 13200,
            revenue: 380000,
            products: 275,
            icon: "🎮",
            growth: 25.4,
            avgRating: 4.6
        },
        {
            id: 9,
            name: "Kitchen & Dining",
            totalSales: 12900,
            revenue: 520000,
            products: 165,
            icon: "🍽️",
            growth: 9.8,
            avgRating: 4.4
        },
        {
            id: 10,
            name: "Pet Supplies",
            totalSales: 11700,
            revenue: 340000,
            products: 125,
            icon: "🐕",
            growth: 31.6,
            avgRating: 4.9
        }
    ];

    // Function to render star rating
    function renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="text-yellow-400">★</span>';
        }

        if (hasHalfStar) {
            stars += '<span class="text-yellow-400">☆</span>';
        }

        return stars;
    }

    // Function to format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Function to get growth color class
    function getGrowthColor(growth) {
        if (growth >= 20) return 'text-green-600 bg-green-100';
        if (growth >= 10) return 'text-blue-600 bg-blue-100';
        if (growth >= 5) return 'text-yellow-600 bg-yellow-100';
        return 'text-gray-600 bg-gray-100';
    }

    // Function to load categories
    function loadCategories() {
        const container = document.getElementById('categories-container');

        data.topCategories.forEach((category, index) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200 cursor-pointer';

            categoryDiv.innerHTML = `
                    <!-- Rank Badge -->
                    <div class="flex-shrink-0 mr-4">
                        <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            ${index + 1}
                        </div>
                    </div>

                    <!-- Category Details -->
                    <div class="flex-grow min-w-0">
                        <div class="flex items-start justify-between mb-2">
                            <h3 class="text-lg font-semibold text-gray-800 truncate">
                                ${category.name}
                            </h3>
                        </div>
                        
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <div class="text-gray-600">Sales</div>
                                <div class="font-semibold text-gray-800">${category.totalUnitsSold}</div>
                            </div>
                            <div>
                                <div class="text-gray-600">Revenue</div>
                                <div class="font-semibold text-green-600">${category.totalRevenue}</div>
                            </div>
                            <div>
                                <div class="text-gray-600">Products</div>
                                <div class="font-semibold text-gray-800">${category.totalProducts}</div>
                            </div>
                        </div>
                    </div>
                `;

            // Add click event listener
            categoryDiv.addEventListener('click', function () {
                alert(`Clicked on ${category.name} - ${formatCurrency(category.revenue)} revenue`);
            });

            container.appendChild(categoryDiv);
        });
    }

    // Load categories when page loads
    loadCategories();








    // Mock data for top 10 brands
    const brands = [
        {
            id: 1,
            name: "Apple",
            totalSales: 45200,
            revenue: 2850000,
            products: 85,
            logo: "🍎",
            brandColor: "bg-gray-900",
            growth: 8.5,
            avgRating: 4.8,
            marketShare: 18.2
        },
        {
            id: 2,
            name: "Samsung",
            totalSales: 38900,
            revenue: 2100000,
            products: 156,
            logo: "📱",
            brandColor: "bg-blue-600",
            growth: 12.3,
            avgRating: 4.6,
            marketShare: 15.6
        },
        {
            id: 3,
            name: "Nike",
            totalSales: 32500,
            revenue: 1750000,
            products: 220,
            logo: "👟",
            brandColor: "bg-orange-500",
            growth: 15.8,
            avgRating: 4.7,
            marketShare: 13.1
        },
        {
            id: 4,
            name: "Sony",
            totalSales: 28700,
            revenue: 1620000,
            products: 180,
            logo: "🎧",
            brandColor: "bg-black",
            growth: 9.2,
            avgRating: 4.5,
            marketShare: 11.5
        },
        {
            id: 5,
            name: "Microsoft",
            totalSales: 26800,
            revenue: 1980000,
            products: 95,
            logo: "💻",
            brandColor: "bg-blue-500",
            growth: 18.4,
            avgRating: 4.4,
            marketShare: 10.8
        },
        {
            id: 6,
            name: "Adidas",
            totalSales: 24200,
            revenue: 1320000,
            products: 285,
            logo: "⚽",
            brandColor: "bg-gray-800",
            growth: 11.7,
            avgRating: 4.6,
            marketShare: 9.7
        },
        {
            id: 7,
            name: "Dell",
            totalSales: 21500,
            revenue: 1580000,
            products: 120,
            logo: "🖥️",
            brandColor: "bg-blue-700",
            growth: 6.9,
            avgRating: 4.3,
            marketShare: 8.6
        },
        {
            id: 8,
            name: "HP",
            totalSales: 19800,
            revenue: 1420000,
            products: 145,
            logo: "🖨️",
            brandColor: "bg-indigo-600",
            growth: 7.8,
            avgRating: 4.2,
            marketShare: 7.9
        },
        {
            id: 9,
            name: "Canon",
            totalSales: 18600,
            revenue: 1250000,
            products: 95,
            logo: "📷",
            brandColor: "bg-red-600",
            growth: 13.5,
            avgRating: 4.7,
            marketShare: 7.5
        },
        {
            id: 10,
            name: "Logitech",
            totalSales: 16900,
            revenue: 890000,
            products: 165,
            logo: "🖱️",
            brandColor: "bg-green-600",
            growth: 22.1,
            avgRating: 4.4,
            marketShare: 6.8
        }
    ];

    // Function to render star rating
    function renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="text-yellow-400">★</span>';
        }

        if (hasHalfStar) {
            stars += '<span class="text-yellow-400">☆</span>';
        }

        return stars;
    }

    // Function to format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Function to get growth color class
    function getGrowthColor(growth) {
        if (growth >= 20) return 'text-green-600 bg-green-100';
        if (growth >= 15) return 'text-emerald-600 bg-emerald-100';
        if (growth >= 10) return 'text-blue-600 bg-blue-100';
        if (growth >= 5) return 'text-yellow-600 bg-yellow-100';
        return 'text-gray-600 bg-gray-100';
    }

    // Function to get market share bar width
    function getMarketShareWidth(marketShare) {
        return Math.max(10, (marketShare / 20) * 100); // Scale to max 100% of container
    }

    // Function to load brands
    function loadBrands() {
        const container = document.getElementById('brands-container');

        brands.forEach((brand, index) => {
            const brandDiv = document.createElement('div');
            brandDiv.className = 'flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200 cursor-pointer';

            brandDiv.innerHTML = `
                    <!-- Rank Badge -->
                    <div class="flex-shrink-0 mr-4">
                        <div class="w-8 h-8 ${brand.brandColor} text-white rounded-full flex items-center justify-center font-bold text-sm">
                            ${index + 1}
                        </div>
                    </div>

                    <!-- Brand Logo -->
                    <div class="flex-shrink-0 mr-4">
                        <div class="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-2xl shadow-sm">
                            ${brand.logo}
                        </div>
                    </div>

                    <!-- Brand Details -->
                    <div class="flex-grow min-w-0">
                        <div class="flex items-start justify-between mb-2">
                            <h3 class="text-lg font-semibold text-gray-800 truncate">
                                ${brand.name}
                            </h3>
                            <div class="flex items-center space-x-2 ml-4">
                                <span class="px-2 py-1 text-xs font-medium rounded-full ${getGrowthColor(brand.growth)}">
                                    +${brand.growth}%
                                </span>
                            </div>
                        </div>
                        
                        <div class="flex items-center mb-3">
                            <div class="flex mr-2">
                                ${renderStars(brand.avgRating)}
                            </div>
                            <span class="text-sm text-gray-600">(${brand.avgRating})</span>
                            <span class="text-sm text-gray-500 ml-3">${brand.marketShare}% market share</span>
                        </div>
                        
                        <!-- Market Share Bar -->
                        <div class="mb-3">
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="${brand.brandColor} h-2 rounded-full transition-all duration-300" style="width: ${getMarketShareWidth(brand.marketShare)}%"></div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <div class="text-gray-600">Sales</div>
                                <div class="font-semibold text-gray-800">${brand.totalSales.toLocaleString()}</div>
                            </div>
                            <div>
                                <div class="text-gray-600">Revenue</div>
                                <div class="font-semibold text-green-600">${formatCurrency(brand.revenue)}</div>
                            </div>
                            <div>
                                <div class="text-gray-600">Products</div>
                                <div class="font-semibold text-gray-800">${brand.products}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Arrow Icon -->
                    <div class="flex-shrink-0 ml-4">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>
                `;

            // Add click event listener
            brandDiv.addEventListener('click', function () {
                alert(`Clicked on ${brand.name} - ${formatCurrency(brand.revenue)} revenue • ${brand.marketShare}% market share`);
            });

            container.appendChild(brandDiv);
        });
    }

    // Load brands when page loads
    loadBrands();


}

function fetchSalesChartData() {
  const startDate = document.getElementById('dashStartDateFilter')?.value || '';
  const endDate = document.getElementById('dashEndDateFilter')?.value || '';

  const queryParams = `startDate=${startDate}&endDate=${endDate}`;

  fetch(`/sales-chart-data?${queryParams}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log(data)
        renderSalesChart(data.labels, data.sales);
      } else {
        console.error("Sales data fetch failed");
      }
    })
    .catch(error => console.error("Error:", error));
}

let salesChart;

function renderSalesChart(labels, sales) {
  const ctx = document.getElementById('salesChart').getContext('2d');

  if (salesChart) {
    salesChart.destroy();
  }

  const chartData = {
    labels: labels,
    datasets: [{
      label: 'Sales ($)',
      data: sales,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#374151',
          font: { size: 14, weight: '500' },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return 'Sales: $' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#f3f4f6', borderColor: '#e5e7eb' },
        ticks: { color: '#6b7280', font: { size: 12 } }
      },
      y: {
        grid: { color: '#f3f4f6', borderColor: '#e5e7eb' },
        ticks: {
          color: '#6b7280',
          font: { size: 12 },
          callback: function (value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  salesChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: chartOptions
  });
}
