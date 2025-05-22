let currentOrderId = null;


function getOrder() {
  fetch("/get-orders", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success && data.orders.length > 0) {
        window.allOrders = data.orders; // store globally
        renderOrderCard(data.orders);

        // Find and show the previously selected order, or default to first
        const selected = data.orders.find(o => o._id === currentOrderId);
        if (selected) {
          renderOrderDetails(selected);
        } else {
          renderOrderDetails(data.orders[0]);
          currentOrderId = data.orders[0]._id;
        }
      }
    })
    .catch(err => console.error("Failed to fetch orders:", err));
}

getOrder();

function accessOdersCard() {
  const odersCard = document.getElementById("odersCard");
  odersCard.innerHTML = "";
  return odersCard;
}

function accessOrderDetails() {
  const orderDetails = document.getElementById("orderDetails");
  orderDetails.innerHTML = "";
  return orderDetails;
}

function renderOrderCard(orders) {
  const odersCard = accessOdersCard();

  orders.forEach((order, index) => {
    const date = new Date(order.placedAt);
    const formattedDate = date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const card = document.createElement("div");
    card.className = "bg-white shadow rounded-2xl p-5 space-y-4 border cursor-pointer";
    card.setAttribute("data-id", order._id); // changed from data-index to data-id for consistency

    card.innerHTML = `
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-800">Order: ${order.orderId}</h3>
                <span class="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full">${order.orderStatus}</span>
            </div>
            <div class="text-sm text-gray-600 space-y-1">
                <p><strong>Total:</strong> ₹${order.grandTotal}</p>
                <p><strong>Payment:</strong> ${order.paymentMethod}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
            </div>
        `;
    odersCard.appendChild(card);
  });

  // Corrected: Use event delegation only once
  odersCard.addEventListener("click", (e) => {
    const card = e.target.closest("[data-id]");
    if (card) {
      const orderId = card.getAttribute("data-id");
      const selectedOrder = window.allOrders.find(o => o._id === orderId);
      if (selectedOrder) {
        currentOrderId = orderId; // store the selected order ID
        renderOrderDetails(selectedOrder);
      }
    }
  });
}


function renderOrderDetails(order) {
  const orderDetails = accessOrderDetails();
  const date = new Date(order.placedAt);
  const formattedDate = date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  orderDetails.innerHTML = `
   <div class="max-w-5xl mx-auto p-6 space-y-8">
    <!-- Header -->
    <div class="bg-white shadow rounded-2xl p-6 space-y-2">
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Order #${order.orderId}</h2>
                <span class="text-sm text-gray-600">Placed on: ${formattedDate}</span>
            </div>
            <div class="text-right space-y-1">
    <span class="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full block">${order.orderStatus}</span>

    ${!["delivered", "cancelled", "returned", "failed"].includes(order.orderStatus) ? `
        <button class="text-sm mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
            onclick="cancelOrder('${order._id}')">
            Cancel Order
        </button>
    ` : ""}

    ${order.orderStatus === "delivered" ? `
        <div id="returnSection">
            ${order.returnRequest ? `
                <span class="text-sm mt-2 inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl">
                    Return Requested
                </span>
            ` : `
                <button class="text-sm mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                    onclick="showReturnInput('${order._id}')">
                    Return Order
                </button>
            `}
            <button onclick="downloadInvoice('${order._id}')"
                class="text-sm mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl">
                Download Invoice
            </button>
        </div>
    ` : ""}
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
    const image = (item.productId.images && item.productId.images.length > 0) ? item.productId.images[0] : 'default-image.jpg';
    return `
        <div class="flex items-center gap-4 border-b pb-4">
            <div class="w-24 h-24">
                <img src="http://localhost:3000/${image}" alt="${item.productId.product_name}" class="w-full h-full object-cover rounded-xl">
            </div>
            <div class="flex-1">
                <h4 class="text-md font-medium text-gray-800">${item.productId.product_name}</h4>
                <p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>
                <p class="text-sm text-gray-600">Price at Purchase: ₹${item.priceAtPurchase}</p>
            </div>
            <div class="text-right space-y-2">
                <p class="text-sm font-semibold text-gray-800">₹${item.priceAtPurchase * item.quantity}</p>
${!['cancelled', 'delivered', 'returned', 'failed'].includes(order.orderStatus) && item.status !== 'cancelled' && item.status !== 'returned'
    ? `<button class="text-sm mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                onclick="cancelOrderItem('${order._id}', '${item.productId._id}')">
            Cancel Item
        </button>`
    : `<span class="text-sm mt-2 inline-block bg-gray-100 text-gray-600 px-4 py-1 rounded-xl">
${item.status && item.status.length > 0 ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'N/A'}
</span>`
}

      
            </div>
        </div>
    `;
  }).join("")}

        </div>
    </div>

    <!-- Total -->
    <div class="bg-white shadow rounded-2xl p-6 text-right">
        <p class="text-lg font-semibold text-green-800">Coupon offer: ₹${order.coupon.discountAmount}</p>
        <p class="text-lg font-semibold text-gray-800">Grand Total: ₹${order.grandTotal}</p>
    </div>
</div>


`;

}

function cancelOrderItem(orderId, itemId) {

  fetch(`/user/order/item/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ orderId, itemId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        location.reload();
      }
    })
    .catch(error => {
      console.error("Error cancelling item:", error);
    });


}


// Optional: Cancel order function (you can implement the API call)
function cancelOrder(orderId) {
  if (!confirm("Are you sure you want to cancel this order?")) return;

  fetch(`/orders/${orderId}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        getOrder();
      }
    })
    .catch(err => {
      console.error("Error cancelling order:", err);
    });
}

function returnOrder(orderId) {
  const reason = prompt("Please enter the reason for returning this order:");
  if (!reason || reason.trim() === "") {
    return;
  }

  fetch(`/orders/${orderId}/return`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ reason }) // send reason to backend
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        getOrder();
      }
    })
    .catch(err => {
      console.error("Error returning order:", err);
    });
}

function showReturnInput(orderId) {
  const returnSection = document.getElementById("returnSection");

  returnSection.innerHTML = `
    <div class="mt-3 space-y-2">
      <input type="text" id="returnReasonInput" placeholder="Enter return reason"
        class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500">
      <button class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
        onclick="submitReturnReason('${orderId}')">
        Submit Return
      </button>
    </div>
  `;
}

function submitReturnReason(orderId) {
  const reason = document.getElementById("returnReasonInput").value.trim();
  if (!reason) {
    return;
  }

  fetch(`/orders/${orderId}/return`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ reason })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        location.reload(); // Refresh the page
      }
    })
    .catch(err => {
      console.error("Error:", err);
    });
}


function downloadInvoice(orderId) {
  fetch(`/orders/${orderId}/invoice`, {
    method: "GET",
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch invoice");
      }
      return res.blob(); // Get binary data
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob); // Create object URL
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click(); // Trigger download
      a.remove(); // Clean up
      window.URL.revokeObjectURL(url); // Free memory
    })
    .catch(err => {
      console.error("Error downloading invoice:", err);
    });
}

async function handleRazorpay(orderId) {
  const res = await fetch("/place-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, paymentMethod: "razorepay" }),
  });

  const data = await res.json();
  
}