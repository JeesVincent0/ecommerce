/**
 * Order Management System - Improved Version
 * Fixed issues: typos, null safety, error handling, and code organization
 */

// Global state management
const OrderManager = {
  allOrders: [],
  currentPage: 1,
  itemsPerPage: 10
};

/**
 * Initialize order list view
 */
function orderList() {
  try {
    // Hide other sections
    hideUserSection();
    hideProductList();
    hideCategoryList();
    accessSalesReportSection();

    // Hide navigation buttons
    hideUserButton();
    hideProductButton();
    hideCategoryButton();

    // Show order section
    const orderSection = document.getElementById("orderSection");
    if (orderSection) {
      orderSection.classList.remove("hidden");
    }

    // Clear previous order details
    const orderDetails = document.getElementById("orderDetails");
    if (orderDetails) {
      orderDetails.innerHTML = "";
    }

    // Fetch orders from server
    fetchOrders();
  } catch (error) {
    console.error("Error initializing order list:", error);
    showErrorMessage("Failed to initialize order list");
  }
}

/**
 * Fetch orders from server
 */
async function fetchOrders(page = 1, limit = 10, searchKey = '') {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(searchKey && { searchKey })
    });

    const response = await fetch(`/get-orders-admin?${queryParams}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.orders) {
      OrderManager.allOrders = data.orders;
      renderOrderTable(data.orders);
      
      // Update pagination if totalPages is provided
      if (data.totalPages) {
        updatePagination(data.totalPages, page);
      }
    } else {
      throw new Error(data.message || "Failed to fetch orders");
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    showErrorMessage("Failed to load orders. Please try again.");
  }
}

/**
 * Render order table with improved error handling
 */
function renderOrderTable(orders) {
  const orderTableBody = document.getElementById("orderTableBody");
  
  if (!orderTableBody) {
    console.error("Order table body element not found");
    return;
  }

  if (!Array.isArray(orders) || orders.length === 0) {
    orderTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 px-6 text-center text-gray-500">
          No orders found
        </td>
      </tr>
    `;
    return;
  }

  orderTableBody.innerHTML = "";

  orders.forEach((order, index) => {
    try {
      const date = formatOrderDate(order.placedAt);
      const hasReturnRequests = checkForReturnRequests(order.items);
      
      const row = `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="py-3 px-6 font-medium">${escapeHtml(order.userName || 'N/A')}</td>
          <td class="py-3 px-6">${escapeHtml(order.orderId || 'N/A')}</td>
          <td class="py-3 px-6">${date}</td>
          <td class="py-3 px-6 font-semibold">₹${formatAmount(order.totalAmount)}</td>
          <td class="py-3 px-6">
            <button 
              class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded transition-colors" 
              data-index="${index}"
              onclick="viewOrder(this)"
              aria-label="View order details for ${order.orderId}">
              View
            </button>
          </td>
          <td class="py-3 px-6" id="notification-${index}">
            ${hasReturnRequests ? "<span class='inline-block w-3 h-3 rounded-full bg-green-500' title='Return request pending'></span>" : ''}
          </td>
        </tr>
      `;

      orderTableBody.innerHTML += row;
    } catch (error) {
      console.error("Error rendering order row:", error, order);
    }
  });
}

/**
 * View order details with improved error handling
 */
function viewOrder(button) {
  try {
    const orderSection = document.getElementById("orderSection");
    const orderDetails = document.getElementById("orderDetails");
    
    if (!orderSection || !orderDetails) {
      throw new Error("Required DOM elements not found");
    }

    const index = parseInt(button.dataset.index);
    const order = OrderManager.allOrders?.[index];

    if (!order) {
      throw new Error("Order not found");
    }

    // Hide order list and show details
    orderSection.classList.add("hidden");
    orderDetails.innerHTML = "";

    // Render order details
    renderOrderDetails(order);
  } catch (error) {
    console.error("Error viewing order:", error);
    showErrorMessage("Failed to load order details");
  }
}

/**
 * Render detailed order view
 */
function renderOrderDetails(order) {
  const orderDetails = document.getElementById("orderDetails");
  const formattedDate = formatOrderDate(order.placedAt);
  
  // Check for order-level return requests
  const orderReturnSection = order.returnRequest ? createReturnRequestSection(order, 'order') : '';
  
  // Check for order-level refund section
  const orderRefundSection = createRefundSection(order, null);

  const orderDetailsHTML = `
    <div class="max-w-5xl mx-auto p-6 space-y-8">
      <!-- Back button -->
      <button 
        onclick="backToOrderList()" 
        class="mb-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
        ← Back to Orders
      </button>

      ${orderReturnSection}
      ${orderRefundSection}

      <!-- Header -->
      <div class="bg-white shadow rounded-2xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Order #${escapeHtml(order.orderId)}</h2>
            <h3 class="text-xl font-semibold text-gray-700 mt-1">Customer: ${escapeHtml(order.userName)}</h3>
            <span class="text-sm text-gray-600">Placed on: ${formattedDate}</span>
          </div>
        </div>
      </div>

      <!-- Address & Payment -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${createAddressSection(order)}
        ${createPaymentSection(order)}
      </div>

      <!-- Items -->
      ${createItemsSection(order)}

      <!-- Total -->
      <div class="bg-white shadow rounded-2xl p-6 text-right">
        <p class="text-lg font-semibold text-gray-800">Total: ₹${formatAmount(order.totalAmount)}</p>
      </div>
    </div>
  `;

  orderDetails.innerHTML = orderDetailsHTML;
}

/**
 * Create address section HTML
 */
function createAddressSection(order) {
  const address = order.shippingAddress || {};
  
  return `
    <div class="bg-white shadow rounded-2xl p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Shipping Address</h3>
      <div class="text-sm text-gray-600 space-y-1">
        <p class="font-medium">${escapeHtml(order.userName || 'N/A')}</p>
        <p>${escapeHtml(address.housename || 'N/A')}</p>
        <p>${escapeHtml(address.street || 'N/A')}</p>
        <p>${escapeHtml(address.city || 'N/A')}, ${escapeHtml(address.state || 'N/A')}, ${escapeHtml(address.postalCode || 'N/A')}</p>
        <p>Phone: ${escapeHtml(address.phone || 'N/A')}</p>
      </div>
    </div>
  `;
}

/**
 * Create payment section HTML
 */
function createPaymentSection(order) {
  return `
    <div class="bg-white shadow rounded-2xl p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>
      <div class="text-sm text-gray-600 space-y-2">
        <p><span class="font-medium">Method:</span> ${escapeHtml((order.paymentMethod || 'N/A').toUpperCase())}</p>
        ${order.refund ? `<p><span class="font-medium">Refund Status:</span> ${escapeHtml(order.refund.toUpperCase())}</p>` : ''}
        ${order.paymentStatus ? `<p><span class="font-medium">Payment Status:</span> ${escapeHtml(order.paymentStatus.toUpperCase())}</p>` : ''}
      </div>
    </div>
  `;
}

/**
 * Create items section HTML
 */
function createItemsSection(order) {
  if (!Array.isArray(order.items) || order.items.length === 0) {
    return `
      <div class="bg-white shadow rounded-2xl p-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Items in this Order</h3>
        <p class="text-gray-500">No items found in this order.</p>
      </div>
    `;
  }

  const itemsHTML = order.items.map(item => createItemHTML(item, order)).join('');
  
  return `
    <div class="bg-white shadow rounded-2xl p-6">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Items in this Order</h3>
      <div class="space-y-6">
        ${itemsHTML}
      </div>
    </div>
  `;
}

/**
 * Create individual item HTML
 */
function createItemHTML(item, order) {
  const product = item.productId || {};
  const imageUrl = getProductImage(product);
  const itemReturnSection = item.returnRequest ? createReturnRequestSection(order, 'item', item) : '';
  const itemRefundSection = createRefundSection(order, item);

  return `
    <div class="border-b pb-6 last:border-b-0">
      ${itemReturnSection}
      ${itemRefundSection}
      
      <div class="flex items-start gap-4">
        <!-- Product Image -->
        <div class="w-24 h-24 flex-shrink-0">
          <img 
            src="${imageUrl}" 
            alt="${escapeHtml(product.product_name || 'Product')}" 
            class="w-full h-full object-cover rounded-xl"
            onerror="this.src='/images/default-product.jpg'"
          >
        </div>

        <!-- Product Details -->
        <div class="flex-1 min-w-0">
          <h4 class="text-md font-medium text-gray-800 truncate">${escapeHtml(product.product_name || 'Unknown Product')}</h4>
          <p class="text-sm text-gray-600 mt-1">Quantity: ${item.quantity || 0}</p>
          <p class="text-sm text-gray-600">Price: ₹${formatAmount(item.priceAtPurchase)}</p>
          
          <!-- Status Management -->
          <div class="mt-3">
            ${createStatusControl(item, order)}
          </div>
        </div>

        <!-- Item Total -->
        <div class="text-right flex-shrink-0">
          <p class="text-lg font-semibold text-gray-800">₹${formatAmount((item.priceAtPurchase || 0) * (item.quantity || 0))}</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create status control (dropdown or display)
 */
function createStatusControl(item, order) {
  const isStatusChangeable = !['returned', 'cancelled', 'failed'].includes(item.orderStatus);
  
  if (isStatusChangeable) {
    return `
      <select 
        class="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full"
        onchange="updateOrderStatus('${order._id}', this.value, '${item.productId?._id || ''}')"
        ${!item.productId?._id ? 'disabled' : ''}
      >
        <option value="failed" ${item.orderStatus === 'failed' ? 'selected' : ''}>Failed</option>
        <option value="placed" ${item.orderStatus === 'placed' ? 'selected' : ''}>Placed</option>
        <option value="processing" ${item.orderStatus === 'processing' ? 'selected' : ''}>Processing</option>
        <option value="shipped" ${item.orderStatus === 'shipped' ? 'selected' : ''}>Shipped</option>
        <option value="delivered" ${item.orderStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
        <option value="cancelled" ${item.orderStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
      </select>
    `;
  } else {
    return `
      <span class="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
        ${item.orderStatus ? item.orderStatus.charAt(0).toUpperCase() + item.orderStatus.slice(1) : 'Unknown'}
      </span>
    `;
  }
}

/**
 * Create return request section
 */
function createReturnRequestSection(order, type, item = null) {
  const returnReason = type === 'order' ? order.returnReason : item?.returnReason;
  const buttonParams = type === 'order' 
    ? `'${order._id}', true`
    : `'${order._id}', '${item?.productId?._id || ''}', true`;
  const rejectParams = type === 'order'
    ? `'${order._id}', false`
    : `'${order._id}', '${item?.productId?._id || ''}', false`;

  return `
    <div class="bg-yellow-50 border border-yellow-300 rounded-2xl p-6 shadow mb-6">
      <h3 class="text-xl font-semibold text-yellow-800 mb-2">Return Request Received</h3>
      <p class="text-sm text-gray-700 mb-4">
        <strong>Reason:</strong> ${escapeHtml(returnReason || "No reason provided")}
      </p>
      <div class="flex justify-end gap-4">
        <button 
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm transition-colors"
          onclick="confirmReturn(${buttonParams})">
          Approve Return
        </button>
        <button 
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm transition-colors"
          onclick="confirmReturn(${rejectParams})">
          Reject Return
        </button>
      </div>
    </div>
  `;
}

/**
 * Create refund section for returned items
 */
function createRefundSection(order, item = null) {
  const isReturned = item ? item.orderStatus === 'returned' : order.orderStatus === 'returned';
  const hasRefund = item ? item.refund : order.refund;
  const canShowRefund = isReturned && !hasRefund && ['cod', 'razorpay'].includes(order.paymentMethod);

  if (!canShowRefund) return '';

  const amount = item ? (item.priceAtPurchase * item.quantity) : order.totalAmount;
  const productId = item ? item.productId?._id : null;
  const approveParams = productId ? `'${order.orderId}', '${productId}', 'approve'` : `'${order.orderId}', 'approve'`;
  const rejectParams = productId ? `'${order.orderId}', '${productId}', 'reject'` : `'${order.orderId}', 'reject'`;

  return `
    <div class="bg-white shadow-sm border border-gray-100 rounded-xl p-5 mb-4">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-start space-x-4">
          <div class="bg-blue-50 p-2.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4l3 3"></path>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 text-lg">Refund Request</h3>
            <p class="text-gray-600 mt-1">
              Customer has requested a refund of <span class="font-medium text-blue-700">₹${formatAmount(amount)}</span>
              ${item ? 'for this item' : `for order #${order.orderId}`}
            </p>
            <div class="flex flex-wrap items-center gap-3 mt-2">
              <span class="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                Pending Approval
              </span>
            </div>
          </div>
        </div>
        
        <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <button
            onclick="processRefund(${approveParams})"
            class="inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            Approve Refund
          </button>
          <button
            onclick="processRefund(${rejectParams})"
            class="inline-flex justify-center items-center px-4 py-2.5 border text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            Reject
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Update order status
 */
async function updateOrderStatus(orderId, newStatus, productId) {
  try {
    const response = await fetch('/orders/status', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        status: newStatus, 
        orderId, 
        productId 
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      showSuccessMessage('Order status updated successfully');
      orderList(); // Refresh the order list
    } else {
      throw new Error(data.message || 'Failed to update order status');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    showErrorMessage('Failed to update order status');
  }
}

/**
 * Confirm return request
 */
async function confirmReturn(orderId, productIdOrApprove, approve = null) {
  try {
    let actualProductId, actualApprove;
    
    // Handle different parameter combinations
    if (typeof productIdOrApprove === 'boolean') {
      actualApprove = productIdOrApprove;
      actualProductId = null;
    } else {
      actualProductId = productIdOrApprove;
      actualApprove = approve;
    }

    const requestBody = { approve: actualApprove };
    if (actualProductId) {
      requestBody.productId = actualProductId;
    }

    const response = await fetch(`/orders/${orderId}/return-request`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      const action = actualApprove ? 'approved' : 'rejected';
      showSuccessMessage(`Return request ${action} successfully`);
      orderList(); // Refresh the order list
    } else {
      throw new Error(data.message || 'Failed to process return request');
    }
  } catch (error) {
    console.error('Error handling return request:', error);
    showErrorMessage('Failed to process return request');
  }
}

/**
 * Process refund
 */
async function processRefund(orderId, productIdOrStatus, status = null) {
  try {
    let actualProductId, actualStatus;
    
    // Handle different parameter combinations
    if (typeof productIdOrStatus === 'string' && (productIdOrStatus === 'approve' || productIdOrStatus === 'reject')) {
      actualStatus = productIdOrStatus;
      actualProductId = null;
    } else {
      actualProductId = productIdOrStatus;
      actualStatus = status;
    }

    const requestBody = { 
      orderId, 
      status: actualStatus 
    };
    
    if (actualProductId) {
      requestBody.productId = actualProductId;
    }

    const response = await fetch('/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      const action = actualStatus === 'approve' ? 'approved' : 'rejected';
      showSuccessMessage(`Refund ${action} successfully`);
      orderList(); // Refresh the order list
    } else {
      throw new Error(data.message || 'Failed to process refund');
    }
  } catch (error) {
    console.error('Error processing refund:', error);
    showErrorMessage('Failed to process refund');
  }
}

/**
 * Search orders
 */
function orderSearch(page = 1, limit = 10) {
  const searchKey = document.getElementById("searchInputOrder")?.value.trim() || '';
  fetchOrders(page, limit, searchKey);
}

/**
 * Clear search and show all orders
 */
function clearSearchOrder() {
  const searchInput = document.getElementById("searchInputOrder");
  if (searchInput) {
    searchInput.value = "";
  }
  toggleClearButtonOrder();
  fetchOrders(); // Fetch all orders
}

/**
 * Toggle clear button visibility
 */
function toggleClearButtonOrder() {
  const searchInput = document.getElementById("searchInputOrder");
  const clearButton = document.getElementById("clearSearchButtonOrder");
  
  if (searchInput && clearButton) {
    if (searchInput.value.trim() !== "") {
      clearButton.classList.remove("hidden");
    } else {
      clearButton.classList.add("hidden");
    }
  }
}

/**
 * Go back to order list
 */
function backToOrderList() {
  const orderSection = document.getElementById("orderSection");
  const orderDetails = document.getElementById("orderDetails");
  
  if (orderSection) {
    orderSection.classList.remove("hidden");
  }
  if (orderDetails) {
    orderDetails.innerHTML = "";
  }
}

// Utility Functions

/**
 * Format order date
 */
function formatOrderDate(dateString) {
  try {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}

/**
 * Format amount with proper handling
 */
function formatAmount(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0.00';
  }
  return amount.toFixed(2);
}

/**
 * Get product image URL with fallback
 */
function getProductImage(product) {
  if (product && product.images && Array.isArray(product.images) && product.images.length > 0) {
    return `http://localhost:3000/${product.images[0]}`;
  }
  return '/images/default-product.jpg';
}

/**
 * Check if order has return requests
 */
function checkForReturnRequests(items) {
  if (!Array.isArray(items)) return false;
  return items.some(item => item.returnRequest);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') {
    return unsafe || '';
  }
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
  // Implement your preferred notification system
  console.log('Success:', message);
  // Example: You might want to show a toast notification here
}

/**
 * Show error message
 */
function showErrorMessage(message) {
  // Implement your preferred notification system
  console.error('Error:', message);
  // Example: You might want to show a toast notification here
}

/**
 * Update pagination (placeholder - implement based on your UI)
 */
function updatePagination(totalPages, currentPage) {
  // Implement pagination UI updates here
  console.log(`Pagination: ${currentPage} of ${totalPages}`);
}

// Export main function for backward compatibility
window.orderLlist = orderList; // Fixed typo
window.orderList = orderList;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners for search functionality
  const searchInput = document.getElementById("searchInputOrder");
  if (searchInput) {
    searchInput.addEventListener('input', toggleClearButtonOrder);
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        orderSearch();
      }
    });
  }
});