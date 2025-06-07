let currentOrderId = null;

// Main function to fetch and display orders
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
      } else {
        showNoOrdersMessage();
      }
    })
    .catch(err => {
      console.error("Failed to fetch orders:", err);
      showErrorMessage("Failed to load orders. Please try again.");
    });
}

// Initialize the page
getOrder();

// Utility functions for DOM access
function accessOrdersCard() {
  const ordersCard = document.getElementById("odersCard"); // Fixed typo but keeping original ID
  ordersCard.innerHTML = "";
  return ordersCard;
}

function accessOrderDetails() {
  const orderDetails = document.getElementById("orderDetails");
  orderDetails.innerHTML = "";
  return orderDetails;
}

// Show message when no orders are found
function showNoOrdersMessage() {
  const ordersCard = accessOrdersCard();
  ordersCard.innerHTML = `
    <div class="text-center py-8">
      <p class="text-gray-500">No orders found</p>
    </div>
  `;
}

// Show error message
function showErrorMessage(message) {
  const ordersCard = accessOrdersCard();
  ordersCard.innerHTML = `
    <div class="text-center py-8">
      <p class="text-red-500">${message}</p>
    </div>
  `;
}

// Render order cards with improved event handling
function renderOrderCard(orders) {
  const ordersCard = accessOrdersCard();

  orders.forEach((order) => {
    const date = new Date(order.placedAt);
    const formattedDate = date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const card = document.createElement("div");
    card.className = "bg-white shadow rounded-2xl p-5 space-y-4 border cursor-pointer hover:shadow-lg transition-shadow";
    card.setAttribute("data-id", order._id);

    card.innerHTML = `
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-800">Order: ${order.orderId}</h3>
      </div>
      <div class="text-sm text-gray-600 space-y-1">
        <p><strong>Total:</strong> ₹${order.grandTotal}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
      </div>
    `;

    // Add click event to individual card
    card.addEventListener("click", () => {
      // Remove active class from all cards
      document.querySelectorAll("[data-id]").forEach(c => c.classList.remove("ring-2", "ring-blue-500"));
      // Add active class to clicked card
      card.classList.add("ring-2", "ring-blue-500");

      currentOrderId = order._id;
      renderOrderDetails(order);
    });

    ordersCard.appendChild(card);
  });
}

// Enhanced order details rendering
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

        </div>
        ${(() => {
      let html = "";
      order.items.some(item => {
        if (item.orderStatus === "delivered") {
          html = `
                <div id="returnSection">
                    <button onclick="downloadInvoice('${order._id}')"
                        class="text-sm mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl">
                        Download Invoice
                    </button>
                </div>
            `;
          return true; // Stop loop
        }
        return false;
      });
      return html;
    })()}
      </div>

      <!-- Address & Payment -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white shadow rounded-2xl p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Shipping Address</h3>
          <p class="text-sm text-gray-600">
            ${order.userName}<br>
            ${order.shippingAddress.housename}<br>
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
          ${order.items.map(item => renderOrderItem(item, order._id)).join("")}
        </div>
      </div>

      <!-- Total -->
      <div class="bg-white shadow rounded-2xl p-6 text-right">
        <p class="text-lg font-semibold text-green-800">Coupon Discount: ₹${(order.coupon?.discountAmount).toFixed(2) || 0}</p>
        <p class="text-lg font-semibold text-gray-800">Grand Total: ₹${(order.grandTotal).toFixed(2)}</p>
      </div>
    </div>
  `;
}

// Render individual order item
function renderOrderItem(item, orderId) {
  const image = (item.productId.images && item.productId.images.length > 0)
    ? item.productId.images[0]
    : 'default-image.jpg';

  return `
    <div class="flex items-center gap-4 border-b pb-4">
      <div class="w-24 h-24">
        <img src="/${image}" 
             alt="${item.productId.product_name}" 
             class="w-full h-full object-cover rounded-xl">
      </div>
      <div class="flex-1">
        <h4 class="text-md font-medium text-gray-800">${item.productId.product_name}</h4>
        <p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>
        <p class="text-sm text-gray-600">Price at Purchase: ₹${item.priceAtPurchase}</p>
      </div>
      
      <div class="text-right space-y-2">
        <p class="text-sm font-semibold text-gray-800">₹${item.priceAtPurchase * item.quantity}</p>
      </div>

      <div class="text-right space-y-1">
        <span class="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full block">${item.orderStatus}</span>
        ${renderItemActions(item, orderId)}
      </div>
    </div>
  `;
}

// Render item-level actions
function renderItemActions(item, orderId) {
  let actions = '';

  if (!["delivered", "cancelled", "returned", "failed", "shipped"].includes(item.orderStatus)) {
    actions += `
      <div id="cancelSection-${item.productId._id}" class="space-y-2">
        <button class="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
            onclick="showItemCancelConfirmation('${orderId}', '${item.productId._id}')">
            Cancel Item
        </button>
      </div>
    `;
  }

  if (item.orderStatus === "delivered") {
    actions += `
      <div class="space-y-2">
        ${item.returnRequest ? `
          <span class="text-sm inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl">
            Return Requested
          </span>
        ` : `
          <button class="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
              onclick="showReturnInput('${orderId}', '${item.productId._id}')">
              Return Item
          </button>
        `}
      </div>
    `;
  }

  return actions;
}

// Show cancel confirmation inline for items
function showItemCancelConfirmation(orderId, productId) {
  const cancelSection = document.getElementById(`cancelSection-${productId}`);

  cancelSection.innerHTML = `
    <div class="space-y-2 p-3 bg-red-50 rounded-xl border border-red-200">
      <p class="text-sm text-red-700 font-medium">Cancel this item?</p>
      <div class="flex gap-2">
        <button class="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition-colors"
            onclick="confirmCancelItem('${orderId}', '${productId}')">
            Yes, Cancel
        </button>
        <button class="text-xs bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded-lg transition-colors"
            onclick="hideCancelConfirmation('${productId}')">
            No, Keep
        </button>
      </div>
    </div>
  `;
}

// Hide cancel confirmation and restore original button
function hideCancelConfirmation(productId) {
  const cancelSection = document.getElementById(`cancelSection-${productId}`);

  cancelSection.innerHTML = `
    <button class="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
        onclick="showItemCancelConfirmation('${cancelSection.dataset.orderId}', '${productId}')">
        Cancel Item
    </button>
  `;
}

// Confirm and execute item cancellation
function confirmCancelItem(orderId, productId) {
  // Show loading state
  const cancelSection = document.getElementById(`cancelSection-${productId}`);
  cancelSection.innerHTML = `
    <div class="text-sm text-gray-500 px-4 py-2">
      Cancelling...
    </div>
  `;

  cancelOrder(orderId, productId);
}

// Enhanced cancel order function
function cancelOrder(orderId, productId = null) {

  fetch(`/orders/${orderId}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showSuccessMessage(`${productId ? 'Item' : 'Order'} cancelled successfully`);
        getOrder(); // Refresh the orders
      } else {
        showErrorMessage(data.message || 'Failed to cancel');
      }
    })
    .catch(error => {
      console.error("Error cancelling:", error);
      showErrorMessage('An error occurred while cancelling');
    });
}

// Enhanced return input with better UX
function showReturnInput(orderId, productId = null) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold mb-4">Return ${productId ? 'Item' : 'Order'}</h3>
      <textarea id="returnReasonInput" 
                placeholder="Please enter the reason for returning..."
                class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                rows="3"></textarea>
      <div class="flex gap-3">
        <button class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-xl transition-colors"
                onclick="closeReturnModal()">
          Cancel
        </button>
        <button class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
                onclick="submitReturnReason('${orderId}', '${productId}')">
          Submit Return
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Close return modal
function closeReturnModal() {
  const modal = document.querySelector('.fixed.inset-0');
  if (modal) {
    modal.remove();
  }
}

// Enhanced return submission
function submitReturnReason(orderId, productId = null) {
  const reason = document.getElementById("returnReasonInput").value.trim();
  if (!reason) {
    alert("Please enter a reason for the return");
    return;
  }

  const body = productId
    ? JSON.stringify({ reason, productId })
    : JSON.stringify({ reason });

  fetch(`/orders/${orderId}/return`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: body
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        closeReturnModal();
        showSuccessMessage('Return request submitted successfully');
        getOrder(); // Refresh the orders
      } else {
        showErrorMessage(data.message || 'Failed to submit return request');
      }
    })
    .catch(err => {
      console.error("Error:", err);
      showErrorMessage('An error occurred while submitting return request');
    });
}

// Enhanced invoice download with better error handling
function downloadInvoice(orderId) {
  // Show loading state
  const button = event.target;
  const originalText = button.textContent;
  button.textContent = 'Downloading...';
  button.disabled = true;

  fetch(`/orders/${orderId}/invoice`, {
    method: "GET",
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch invoice");
      }
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showSuccessMessage('Invoice downloaded successfully');
    })
    .catch(err => {
      console.error("Error downloading invoice:", err);
      showErrorMessage('Failed to download invoice');
    })
    .finally(() => {
      // Restore button state
      button.textContent = originalText;
      button.disabled = false;
    });
}

// Utility functions for user feedback
function showSuccessMessage(message) {
  showToast(message, 'success');
}

function showErrorMessage(message) {
  showToast(message, 'error');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 p-4 rounded-xl text-white z-50 ${type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Enhanced Razorpay handler with better error handling
async function handleRazorpay(orderId) {
  try {
    const res = await fetch("/place-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, paymentMethod: "razorpay" }),
    });

    const data = await res.json();

    if (data.success) {
      // Handle successful payment initialization
      return data;
    } else {
      showErrorMessage(data.message || 'Payment initialization failed');
    }
  } catch (error) {
    console.error('Razorpay error:', error);
    showErrorMessage('Payment service unavailable');
  }
}