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
    ${ order.returnRequest ? "<span class='inline-block w-3 h-3 rounded-full bg-green-500'></span>" : ""}
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
            <!-- Header -->
            <div class="bg-white shadow rounded-2xl p-6 space-y-2">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">Order #${order.orderId}</h2>
                        <h2 class="text-xl font-bold text-gray-800">User name: ${order.userName}</h2>
                        <span class="text-sm text-gray-600">Placed on: ${formattedDate}</span>
                    </div>
                    <div class="text-right space-y-1">
<select 
  class="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full block"
  onchange="updateOrderStatus('${order._id}', this.value)"
>
  <option value="placed" ${order.orderStatus === 'placed' ? 'selected' : ''}>Placed</option>
  <option value="processing" ${order.orderStatus === 'processing' ? 'selected' : ''}>Processing</option>
  <option value="shipped" ${order.orderStatus === 'shipped' ? 'selected' : ''}>Shipped</option>
  <option value="delivered" ${order.orderStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
  <option value="cancelled" ${order.orderStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
  <option value="returned" ${order.orderStatus === 'returned' ? 'selected' : ''}>Returned</option>
</select>
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
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Payment Method</h3>
                    <p class="text-sm text-gray-600">${order.paymentMethod}</p>
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
        alert("Order status updated");
        orderLlist()
      } else {
        alert("Failed to update status");
      }
    })
    .catch(err => {
      console.error("Error updating order:", err);
      alert("Something went wrong");
    });
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
        alert(`Return ${approve ? "approved" : "rejected"}`);
        orderLlist();
      } else {
        alert("Failed to update return status");
      }
    })
    .catch(err => {
      console.error("Error handling return request:", err);
      alert("Something went wrong");
    });
}
