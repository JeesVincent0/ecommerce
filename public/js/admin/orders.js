function orderLlist() {

  hideUserSection()
  hideProductList()
  hideCategoryList()


  hideUserButton()
  hideProductButton()
  hideCategoryButton()

  const orderSection = document.getElementById("orderSection");
  orderSection.classList.remove("hidden")

  const orderDetails = document.getElementById("orderDetails");
  orderDetails.innerHTML = "";

  fetch("/get-orders-admin", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        renderOrderTable(data.orders)
        console.log(data.orders)
      }
    })


}

function renderOrderTable(orders) {

  const orderTableBody = document.getElementById("orderTableBody");
  orderTableBody.innerHTML = "";

  // Store globally for use in viewOrder
  window.allOrders = orders;

  orders.forEach((order, index) => {
    const date = new Date(order.placedAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const row = `
          <tr class="">
            <td class="py-3 px-6">${order.userName}</td>
            <td class="py-3 px-6">${order.orderId}</td>
            <td class="py-3 px-6">${date}</td>
            <td class="py-3 px-6">₹${order.totalAmount}</td>
            <td class="py-3 px-6 ${order.orderStatus === 'delivered' ? 'text-green-600' : 'text-yellow-600'}">${order.orderStatus}</td>
            <td class="py-3 px-6 space-x-2">
              <button 
                class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded" 
                data-index="${index}"
                onclick="viewOrder(this)">
                View
              </button>

            </td>
            <td class="py-3 px-6">
    ${order.returnRequest ? "<span class='inline-block w-3 h-3 rounded-full bg-green-500'></span>" : ""}
</td>

          </tr>
        `;

    orderTableBody.innerHTML += row;
  });
}

function viewOrder(button) {

  const orderSection = document.getElementById("orderSection");
  orderSection.classList.add("hidden")

  const index = button.dataset.index;
  const order = window.allOrders?.[index];

  const orderDetails = document.getElementById("orderDetails");
  orderDetails.innerHTML = "";

  const date = new Date(order.placedAt);
  const formattedDate = date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  // You can call renderOrderDetails(order) or open a modal here

  if (order.returnRequest) {
    orderDetails.innerHTML += `
    <div class="bg-yellow-50 border border-yellow-300 rounded-2xl p-6 shadow mt-6 max-w-2xl mx-auto">
      <h3 class="text-xl font-semibold text-yellow-800 mb-2">Return Request Received</h3>
      <p class="text-sm text-gray-700 mb-4"><strong>Reason:</strong> ${order.returnReason || "No reason provided"}</p>
      <div class="flex justify-end gap-4">
        <button 
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm"
          onclick="confirmReturn('${order._id}', true)">
          Approve Return
        </button>
        <button 
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm"
          onclick="confirmReturn('${order._id}', false)">
          Reject Return
        </button>
      </div>
    </div>
  `;
  }


  orderDetails.innerHTML += `
        <div class="max-w-5xl mx-auto p-6 space-y-8">
${!order.refund ? `
        ${["returned"].includes(order.orderStatus) && (order.paymentMethod === "cod" || order.paymentMethod === "razorpay" ) ?
      `<div class="bg-white shadow-sm border border-gray-100 rounded-xl p-5 my-4">
  <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
    <div class="flex items-start space-x-4">
      <div class="bg-blue-50 p-2.5 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v4l3 3"></path>
        </svg>
      </div>
      <div>
        <h3 class="font-semibold text-gray-900 text-lg">Refund Request</h3>
        <p class="text-gray-600 mt-1">Customer has requested a refund of <span class="font-medium text-blue-700">₹${order.totalAmount}</span> for order #${order.orderId}</p>
        <div class="flex flex-wrap items-center gap-3 mt-2">
          <span class="inline-flex items-center text-xs font-medium text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4l3 3"></path>
            </svg>
            Requested 
          </span>
          <span class="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
            Pending Approval
          </span>
        </div>
      </div>
    </div>
    
    <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
      <button 
        onclick="processRefund('${order.orderId}', 'approve')" 
        class="inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 13l4 4L19 7"></path>
        </svg>
        Approve Refund
      </button>
      
      <button 
        onclick="processRefund('${order.orderId}', 'reject')" 
        class="inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        Reject
      </button>
    </div>
  </div>
</div>` : ``} ` : ``}


    <!-- Header -->
    <div class="bg-white shadow rounded-2xl p-6 space-y-2">
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Order #${order.orderId}</h2>
                <h2 class="text-xl font-bold text-gray-800">User name: ${order.userName}</h2>
                <span class="text-sm text-gray-600">Placed on: ${formattedDate}</span>
            </div>
<div class="text-right space-y-1">
    ${order.orderStatus !== 'returned' && order.orderStatus !== 'cancelled' && order.orderStatus !== 'failed' ? `
        <select 
            class="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full block"
            onchange="updateOrderStatus('${order._id}', this.value)"
        >
            <option value="failed" ${order.orderStatus === 'failed' ? 'selected' : ''}>Failed</option>
            <option value="placed" ${order.orderStatus === 'placed' ? 'selected' : ''}>Placed</option>
            <option value="processing" ${order.orderStatus === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="shipped" ${order.orderStatus === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${order.orderStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.orderStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            <option value="returned" ${order.orderStatus === 'returned' ? 'selected' : ''}>Returned</option>
        </select>
    ` : `
        <span class="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full block">
            ${order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
        </span>
    `}
</div>

        </div>
    </div>

    <!-- Address & Payment -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white shadow rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Shipping Address</h3>
            <p class="text-sm text-gray-600">
                ${order.userName}<br>
                ${order.shippingAddress.housename} <br>
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.postalCode}<br>
                Phone: ${order.shippingAddress.phone}
            </p>
        </div>
        <div class="bg-white shadow rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Payment Details</h3>
            <p class="text-sm text-gray-600">Payment Method : ${order.paymentMethod.toUpperCase()}</p>
            ${order.refund ? `<p class="text-sm text-gray-600">Refund : ${order.refund.toUpperCase()}</p>` : ``}
        </div>
    </div>

    <!-- Items -->
    <div class="bg-white shadow rounded-2xl p-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Items in this Order</h3>
        <div class="space-y-4">
            ${order.items.map(item => {
        // Check if images exist and handle undefined or empty arrays
        const image = (item.images && item.images.length > 0) ? item.images[0] : 'default-image.jpg'; // fallback to default image
        return `
                    <div class="flex items-center gap-4 border-b pb-4">
                        <!-- Render image -->
                        <div class="w-24 h-24">
                            <img src="http://localhost:3000/${item.productId.images[0]}" alt="${item.product_name}" class="w-full h-full object-cover rounded-xl">
                        </div>
                        <div class="flex-1">
                            <h4 class="text-md font-medium text-gray-800">${item.productId.product_name}</h4>
                            <p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>
                            <p class="text-sm text-gray-600">Price at Purchase: ₹${item.priceAtPurchase}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-semibold text-gray-800">₹${item.priceAtPurchase * item.quantity}</p>
                        </div>
                    </div>
                `;
      }).join("")}
        </div>
    </div>

    <!-- Total -->
    <div class="bg-white shadow rounded-2xl p-6 text-right">
        <p class="text-lg font-semibold text-gray-800">Total: ₹${order.totalAmount}</p>
    </div>
</div>

    `;
}

function updateOrderStatus(orderId, newStatus) {
  console.log("Order ID:", orderId);
  console.log("New Status:", newStatus);

  // Example: AJAX call to update order status
  fetch(`/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: newStatus })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        orderLlist()
      }
    })
}


function confirmReturn(orderId, approve) {
  const status = approve ? "returned" : "delivered"; // or keep as-is if rejected
  const url = `/orders/${orderId}/return-request`;

  fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approve })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        orderLlist();
      } else {
      }
    })
    .catch(err => {
      console.error("Error handling return request:", err);
    });
}


// function orderSearch(page = 1, limit = 9) {
//   const searchKey = document.getElementById("searchInputPro").value.trim()
//   console.log("category search", searchKey)

//   fetch(`/products/search?key=${searchKey}&page=${page}&limit=${limit}`, {
//     method: "GET",
//     headers: { "Content-Type": "application/json" },
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       console.log(data)
//       renderProducts(data.product)
//       productPagination(data.totalPages, page, productSearch)
//     })
//     .catch((error) => console.log(error.message))
// }

//this button function is for search clear button
function toggleClearButtonOrder() {
  const searchInput = document.getElementById("searchInputOrder");
  const clearButton = document.getElementById("clearSearchButtonOrder");

  if (searchInput.value.trim() !== "") {
    clearButton.classList.remove("hidden");
  } else {
    clearButton.classList.add("hidden");
  }
}

//this function will inoke and render user after clicking the clear button
function clearSearchOrder() {
  const searchInput = document.getElementById("searchInputOrder");
  searchInput.value = "";
  toggleClearButtonProducts();
  loadProducts()
}

function orderSearch(page = 1, limit = 10) {
  const searchKey = document.getElementById("searchInputOrder").value.trim(); // Get the search term

  // If there's no search term, we clear the results
  if (!searchKey) {
    return;
  }

  fetch(`/get-orders-admin?page=${page}&limit=${limit}&searchKey=${searchKey}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        renderOrderTable(data.orders)// Update pagination
      }
    })
    .catch((error) => {
      console.error("Error fetching orders:", error);
    });
}

// Function to handle clear search input and reset results
function clearSearchOrder() {
  const searchInput = document.getElementById("searchInputOrder");
  searchInput.value = "";
  orderSearch(); // Call orderSearch with default parameters (page = 1, limit = 10)
}

// let sortDirection = [true, true];
// function sortTable1(colIndex) {
//     const tbody = document.getElementById("orderTableBody");
//     const rows = Array.from(tbody.rows);

//     rows.sort((a, b) => {
//         const cellA = a.cells[colIndex].innerText.toLowerCase();
//         const cellB = b.cells[colIndex].innerText.toLowerCase();
//         if (cellA < cellB) return sortDirection[colIndex] ? -1 : 1;
//         if (cellA > cellB) return sortDirection[colIndex] ? 1 : -1;
//         return 0;
//     });

//     sortDirection[colIndex] = !sortDirection[colIndex];
//     tbody.innerHTML = "";
//     rows.forEach(row => tbody.appendChild(row));
// }

function processRefund(orderId, status) {
  fetch("/refund", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, status })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        orderLlist()
      }
    })
    .catch(error => console.log(error))
}