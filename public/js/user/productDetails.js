// Cart State Management
const cartState = {
  items: [],
  totalPrice: 0,
  totalItems: 0
};

// DOM Element Selectors - Cached for performance
const selectors = {
  getCartSection: () => document.getElementById("cartSection"),
  getSideSection: () => document.getElementById("sideSection"),
  getProcessButton: () => document.getElementById("processButton")
};

// Clear and access sections with error handling
const domHelpers = {
  accessCartSection: () => {
    const section = selectors.getCartSection();
    if (!section) console.error("Cart section not found");
    else section.innerHTML = "";
    return section;
  },

  accessSideSection: () => {
    const section = selectors.getSideSection();
    if (!section) console.error("Side section not found");
    else section.innerHTML = "";
    return section;
  }
};

// API Service - Handles all fetch operations
const cartAPI = {
  // Generic fetch handler with error handling
  async fetchWithErrorHandling(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers
        }
      });
      console.log("jadlksfda", response)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.message}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${url}):`, error);
      return { success: false, error: error.message };
    }
  },

  // Cart operations
  async addToCart(productId) {
    return this.fetchWithErrorHandling(`/add-to-cart/${productId}`, { method: "POST" });
  },

  async getCart() {
    return this.fetchWithErrorHandling("/get-cart");
  },

  async decrementItem(productId) {
    return this.fetchWithErrorHandling(`/decrement-cart/${productId}`, { method: "POST" });
  },

  async deleteItem(productId) {
    return this.fetchWithErrorHandling(`/delete-item/${productId}`, { method: "DELETE" });
  },

  async proceedToCheckout() {
    return this.fetchWithErrorHandling("/checkout");
  },

  // Address management
  async getAddress(addressId) {
    return this.fetchWithErrorHandling(`/getaddress/${addressId}`);
  },

  async updateAddress(addressId, addressData) {
    return this.fetchWithErrorHandling(`/update-address/${addressId}`, {
      method: "POST",
      body: JSON.stringify(addressData)
    });
  },

  async saveNewAddress(userId, addressData) {
    return this.fetchWithErrorHandling(`/save-address/${userId}`, {
      method: "POST",
      body: JSON.stringify(addressData)
    });
  },

  async deleteAddress(addressId) {
    return this.fetchWithErrorHandling(`/address/${addressId}`, { method: "DELETE" });
  },

  async selectAddress(addressId) {
    return this.fetchWithErrorHandling("/select-address", {
      method: "POST",
      body: JSON.stringify({ addressId })
    });
  },

  // Order processing
  async placeOrder(paymentMethod, orderId) {
    return this.fetchWithErrorHandling("/place-order", {
      method: "POST",
      body: JSON.stringify({ paymentMethod, orderId })
    });
  },

  async verifyPayment(paymentData) {
    return this.fetchWithErrorHandling("/verify-payment", {
      method: "POST",
      body: JSON.stringify(paymentData)
    });
  },

  // Wishlist operations
  async addToWishlist(productId) {
    return this.fetchWithErrorHandling("/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ productId })
    });
  }
};

// Cart UI Controller - Handles UI updates
const cartUI = {
  // Main cart rendering
  renderCartItems(cart, coupons) {
    if (!cart || !cart.items || !cart.items.length) {
      this.renderEmptyCart();
      return;
    }

    let totalPrice = 0;
    let totalItems = 0;
    const cartSection = domHelpers.accessCartSection();

    // Create cart item cards
    cart.items.forEach(item => {
      const itemTotal = item.quantity * item.priceAtTime;
      totalItems += item.quantity;
      totalPrice += itemTotal;

      cartSection.innerHTML += `
        <div class="flex items-center gap-4 p-4 border rounded-md shadow-sm bg-white mb-4 max-w-3xl mx-auto transform transition-all duration-200 hover:shadow-md">
          <!-- Product Image -->
          <img src="http://localhost:3000/${item.productId.images[0]}" alt="${item.productId.product_name}" 
               class="w-24 h-24 object-cover rounded-md" />

          <!-- Product Info -->
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800">${item.productId.product_name}</h3>
            <p class="text-sm text-gray-500">Price: ₹${item.priceAtTime}</p>
          </div>

          <!-- Quantity Control -->
          <div class="flex items-center gap-2">
            <button onclick="cartActions.decrementItem('${item.productId._id}')" 
                    class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200">
              <span aria-hidden="true">-</span>
              <span class="sr-only">Decrease quantity</span>
            </button>
            <span class="px-3">${item.quantity}</span>
            <button onclick="cartActions.incrementItem('${item.productId._id}')" 
                    class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200">
              <span aria-hidden="true">+</span>
              <span class="sr-only">Increase quantity</span>
            </button>
          </div>

          <!-- Total Price -->
          <div class="w-28 text-right">
            <p class="font-medium">₹${itemTotal}</p>
          </div>

          <!-- Remove Button -->
          <button onclick="cartActions.deleteItem('${item.productId._id}')" 
                  class="ml-4 text-red-500 hover:text-red-700 transition-colors duration-200"
                  aria-label="Remove item">
            <span aria-hidden="true">🗑️</span>
          </button>
        </div>`;
    });

    // Update cart state
    cartState.items = cart.items;
    cartState.totalPrice = totalPrice;
    cartState.totalItems = totalItems;

    // Render order summary
    this.renderOrderSummary(totalItems, totalPrice, totalPrice, coupons);
  },

  renderEmptyCart() {
    const cartSection = domHelpers.accessCartSection();
    const sideSection = domHelpers.accessSideSection();

    cartSection.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
        <p class="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
        <a href="/productlist" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
          Continue Shopping
        </a>
      </div>
    `;

    sideSection.innerHTML = '';
  },

  renderOrderSummary(totalItems, totalPrice, grandTotal = totalPrice, coupons) {
    console.log(coupons)
    const sideSection = domHelpers.accessSideSection();

    sideSection.innerHTML = `
      <div class="w-full max-w-sm mx-auto mt-6 p-4 border rounded-md shadow-md bg-white">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Price Details</h2>

        <!-- Subtotal -->
        <div class="flex justify-between text-sm text-gray-700 mb-2">
          <span>Subtotal (${totalItems} items)</span>
          <span>₹${totalPrice}</span>
        </div>

        <!-- Delivery Charges -->
        <div class="flex justify-between text-sm text-gray-700 mb-2">
          <span>Delivery Charges</span>
          <span class="text-green-600 font-medium">Free</span>
        </div>

        <!-- coupon offer -->
        <div class="flex justify-between text-sm text-gray-700 mb-2">
          <span>Coupon offer</span>
          <span class="text-green-600 font-medium">₹${grandTotal - totalPrice}</span>
        </div>

<!-- Apply coupon -->
<div class="w-full max-w-md mx-auto mt-6 hidden" id="applyCoupon">
  <label for="coupon" class="block text-sm font-medium text-gray-700 mb-1" id="couponLabel">Coupon Code</label>
  <div class="relative">
    <input
      type="text"
      id="couponCode"
      name="coupon"
      placeholder="Enter coupon"
      class="w-full pr-20 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      onclick="applyCoupon()"
      class="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700"
    >
      Apply
    </button>
  </div>
  <div class="max-h-48 overflow-y-auto space-y-2 mt-3">
    ${coupons ? coupons.map(coupon => `
      <div class="px-4 py-2 border rounded-lg bg-gray-100 text-sm text-gray-800 flex justify-between items-center">
        <span>${coupon.code}</span>
      </div>
    `).join("") : ""}
  </div>
</div>


        <hr class="my-3" />

        <!-- Total -->
        <div class="flex justify-between text-md font-semibold text-gray-800 mb-4">
          <span>Total Amount</span>
          <span>₹${grandTotal}</span>
        </div>

        <!-- Checkout Button -->
        <button id="processButton" onclick="cartActions.proceedToCheckout()" 
                class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
          Proceed to Checkout
        </button>
        <button id="processButton2" onclick="checkOutFinal()" 
                class="hidden w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
          Proceed to Checkout
        </button>
      </div>

      `;
  },

  // Address section UI
  renderAddressList(addresses) {
    if (!addresses || !addresses.length) {
      this.renderAddNewAddressForm(addresses[0]?.userId || '');
      return;
    }

    const cartSection = domHelpers.accessCartSection();
    const processButton = selectors.getProcessButton();

    if (processButton) {
      processButton.classList.remove("hidden");
      processButton.innerText = "Continue with Selected Address";
    }

    cartSection.innerHTML = '<h2 class="text-2xl font-semibold text-gray-800 mb-6 px-10">Select Delivery Address</h2>';

    addresses.forEach((address, index) => {
      const isChecked = index === 0 ? "checked" : "";
      const ringClass = index === 0 ? "ring-2 ring-blue-500" : "";

      cartSection.innerHTML += `
        <div onclick="cartActions.selectAddressUI(this, '${address._id}')" 
          class="mt-6 p-6 m-10 relative bg-white rounded-2xl shadow-lg border border-gray-200 cursor-pointer transition duration-200 hover:shadow-xl space-y-4 ${ringClass}"
          data-id="${address._id}">

          <input type="radio" name="selectedAddress" value="${address._id}" class="hidden" ${isChecked} />

          <div>
            <label class="text-sm text-gray-500">House Name</label>
            <div class="text-gray-800 font-medium">${address.housename}</div>
          </div>

          <div class="flex gap-4">
            <div class="w-1/2">
              <label class="text-sm text-gray-500">City</label>
              <div class="text-gray-800 font-medium">${address.city}</div>
            </div>
            <div class="w-1/2">
              <label class="text-sm text-gray-500">Street</label>
              <div class="text-gray-800 font-medium">${address.street}</div>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="w-1/2">
              <label class="text-sm text-gray-500">State</label>
              <div class="text-gray-800 font-medium">${address.state}</div>
            </div>
            <div class="w-1/2">
              <label class="text-sm text-gray-500">Pin</label>
              <div class="text-gray-800 font-medium">${address.postalCode}</div>
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-500">Address Type</label>
            <div class="text-blue-600 font-semibold">${address.label}</div>
          </div>

          <!-- Aligned Buttons -->
          <div class="absolute bottom-4 right-4 flex gap-3">
            <button onclick="event.stopPropagation(); cartActions.editAddress('${address._id}')"
              class="bg-blue-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200">
              Edit
            </button>
            <button onclick="event.stopPropagation(); cartActions.deleteAddress('${address._id}')"
              class="bg-red-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200">
              Delete
            </button>
          </div>
        </div>`;
    });

    cartSection.innerHTML += `
      <button onclick="cartActions.addNewAddress('${addresses[0].userId}')"
        class="block mx-10 mt-6 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
        Add New Address
      </button>`;
  },

  renderAddressList(addresses) {
    if (!addresses || !addresses.length) {
      this.renderAddNewAddressForm(addresses[0]?.userId || '');
      return;
    }

    const cartSection = domHelpers.accessCartSection();
    const processButton = selectors.getProcessButton();

    if (processButton) {
      processButton.classList.remove("hidden");
      processButton.innerText = "Continue with Selected Address";
      // FIX: Set the correct event handler for the button
      processButton.onclick = () => cartActions.continueWithSelectedAddress();
    }

    cartSection.innerHTML = '<h2 class="text-2xl font-semibold text-gray-800 mb-6 px-10">Select Delivery Address</h2>';

    addresses.forEach((address, index) => {
      const isChecked = index === 0 ? "checked" : "";
      const ringClass = index === 0 ? "ring-2 ring-blue-500" : "";

      cartSection.innerHTML += `
      <div onclick="cartActions.selectAddressUI(this, '${address._id}')" 
        class="mt-6 p-6 m-10 relative bg-white rounded-2xl shadow-lg border border-gray-200 cursor-pointer transition duration-200 hover:shadow-xl space-y-4 ${ringClass}"
        data-id="${address._id}">

        <input type="radio" name="selectedAddress" value="${address._id}" class="hidden" ${isChecked} />

        <div>
          <label class="text-sm text-gray-500">House Name</label>
          <div class="text-gray-800 font-medium">${address.housename}</div>
        </div>

        <div class="flex gap-4">
          <div class="w-1/2">
            <label class="text-sm text-gray-500">City</label>
            <div class="text-gray-800 font-medium">${address.city}</div>
          </div>
          <div class="w-1/2">
            <label class="text-sm text-gray-500">Street</label>
            <div class="text-gray-800 font-medium">${address.street}</div>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="w-1/2">
            <label class="text-sm text-gray-500">State</label>
            <div class="text-gray-800 font-medium">${address.state}</div>
          </div>
          <div class="w-1/2">
            <label class="text-sm text-gray-500">Pin</label>
            <div class="text-gray-800 font-medium">${address.postalCode}</div>
          </div>
        </div>

        <div>
          <label class="text-sm text-gray-500">Address Type</label>
          <div class="text-blue-600 font-semibold">${address.label}</div>
        </div>

        <!-- Aligned Buttons -->
        <div class="absolute bottom-4 right-4 flex gap-3">
          <button onclick="event.stopPropagation(); cartActions.editAddress('${address._id}')"
            class="bg-blue-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200">
            Edit
          </button>
          <button onclick="event.stopPropagation(); cartActions.deleteAddress('${address._id}')"
            class="bg-red-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200">
            Delete
          </button>
        </div>
      </div>`;
    });

    cartSection.innerHTML += `
    <button onclick="cartActions.addNewAddress('${addresses[0].userId}')"
      class="block mx-10 mt-6 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
      Add New Address
    </button>`;
  },

  renderAddNewAddressForm(userId) {
    const processButton = selectors.getProcessButton();
    if (processButton) processButton.classList.add("hidden");

    const cartSection = domHelpers.accessCartSection();

    cartSection.innerHTML = `
      <div class="max-w-2xl mx-auto px-4 py-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Add New Address</h2>
        
        <form class="bg-white rounded-xl shadow-md p-6" onsubmit="cartActions.submitNewAddress(event, '${userId}')">
          <div class="space-y-4">
            <div>
              <label id="label-housename" for="housename" class="block text-sm font-medium text-gray-700 mb-1">House Name</label>
              <input type="text" name="housename" id="housename" 
                    class="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div>
              <label id="label-city" for="city" class="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" name="city" id="city" 
                    class="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div>
              <label id="label-street" for="street" class="block text-sm font-medium text-gray-700 mb-1">Street</label>
              <input type="text" name="street" id="street" 
                    class="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label id="label-state" for="state" class="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" name="state" id="state" 
                      class="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label id="label-postalCode" for="postalCode" class="block text-sm font-medium text-gray-700 mb-1">Pin</label>
                <input type="text" name="postalCode" id="postalCode" 
                      class="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>

            <div>
              <label id="label-addressType" for="addressType" class="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <select id="addressType" name="addressType" 
                      class="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select</option>
                <option value="home">Home</option>
                <option value="office">Office</option>
              </select>
            </div>
          </div>

          <div class="flex justify-between mt-6">
            <button type="button" onclick="cartActions.proceedToCheckout()"
                  class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200">
              Cancel
            </button>
            <button type="submit"
                  class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Save Address
            </button>
          </div>
        </form>
      </div>`;
  },

  // Payment UI
  renderPaymentOptions(orderId) {
    const cartSection = domHelpers.accessCartSection();
    const processButton = selectors.getProcessButton();

    const applyCoupon = document.getElementById("applyCoupon");
    applyCoupon.classList.remove("hidden")

    if (processButton) {
      processButton.innerHTML = "Place Order";
      processButton.onclick = () => cartActions.processPayment();
    }

    cartSection.innerHTML = `
      <div class="max-w-2xl mx-auto px-4 py-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Select Payment Method</h2>
        
        <form id="paymentForm" class="bg-white rounded-xl shadow-md p-6 space-y-5">
          <!-- Hidden orderId input -->
          <input type="hidden" name="orderId" value="${orderId}">

          <div class="space-y-4">
            <!-- COD (Enabled) -->
            <label class="flex items-center p-4 border-2 border-green-500 rounded-xl cursor-pointer hover:bg-green-50 transition-colors duration-200">
              <input type="radio" name="paymentMethod" value="cod" class="form-radio text-green-600" checked>
              <span class="ml-3 font-medium text-gray-800">Cash on Delivery (COD)</span>
            </label>

            <!-- Razorpay (Coming Soon) -->
            <label class="flex items-center p-4 border-2 border-green-500 rounded-xl cursor-pointer hover:bg-green-50 transition-colors duration-200">
              <input type="radio" name="paymentMethod" value="razorpay" class="form-radio">
              <span class="ml-3 font-medium text-gray-800">Razorpay </span>
            </label>
        </form>
      </div>`;
  },

  // Form validation helpers
  validateAddressForm(form) {
    const fields = [
      { name: "housename", label: "label-housename", display: "House Name" },
      { name: "city", label: "label-city", display: "City" },
      { name: "street", label: "label-street", display: "Street" },
      { name: "state", label: "label-state", display: "State" },
      { name: "postalCode", label: "label-postalCode", display: "Pin" },
      { name: "addressType", label: "label-addressType", display: "Label" }
    ];

    let isValid = true;

    fields.forEach(field => {
      const input = form[field.name];
      const label = document.getElementById(field.label);

      if (!input.value.trim()) {
        label.innerText = `${field.display} is required`;
        label.style.color = "red";
        input.classList.add("border-red-500");
        isValid = false;
      } else if (field.name === "postalCode" && !/^\d{6}$/.test(input.value.trim())) {
        label.innerText = `${field.display} must be 6 digits`;
        label.style.color = "red";
        input.classList.add("border-red-500");
        isValid = false;
      } else {
        label.innerText = `${field.display}`;
        label.style.color = "#374151"; // text-gray-700
        input.classList.remove("border-red-500");
      }
    });

    return isValid;
  },
  renderAddressEditForm(address) {
    const processButton = selectors.getProcessButton();
    if (processButton) processButton.classList.add("hidden");

    const cartSection = domHelpers.accessCartSection();

    cartSection.innerHTML = `
      <div class="max-w-2xl mx-auto px-4 py-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Edit Address</h2>
        
        <form class="bg-white rounded-xl shadow-md p-6" onsubmit="cartActions.submitAddressUpdate(event, '${address._id}')">
          <div class="space-y-4">
            <div>
              <label id="label-housename" for="housename" class="block text-sm font-medium text-gray-700 mb-1">House Name</label>
              <input type="text" name="housename" id="housename" value="${address.housename}" 
                    class="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div>
              <label id="label-city" for="city" class="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" name="city" id="city" value="${address.city}" 
                    class="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div>
              <label id="label-street" for="street" class="block text-sm font-medium text-gray-700 mb-1">Street</label>
              <input type="text" name="street" id="street" value="${address.street}" 
                    class="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label id="label-state" for="state" class="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" name="state" id="state" value="${address.state}" 
                      class="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label id="label-postalCode" for="postalCode" class="block text-sm font-medium text-gray-700 mb-1">Pin</label>
                <input type="text" name="postalCode" id="postalCode" value="${address.postalCode}" 
                      class="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>

            <div>
              <label id="label-addressType" for="addressType" class="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <select id="addressType" name="addressType" 
                      class="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select</option>
                <option value="home" ${address.label === "home" ? "selected" : ""}>Home</option>
                <option value="office" ${address.label === "office" ? "selected" : ""}>Office</option>
              </select>
            </div>
          </div>

          <div class="flex justify-between mt-6">
            <button type="button" onclick="cartActions.proceedToCheckout()"
                  class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200">
              Cancel
            </button>
            <button type="submit"
                  class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Save Changes
            </button>
          </div>
        </form>
      </div>`;
  },

  // Toast notifications
  showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col items-end space-y-2';
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `px-4 py-2 rounded-lg shadow-lg flex items-center ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      } transform transition-all duration-300 opacity-0 translate-x-8`;

    const icon = document.createElement('span');
    icon.className = 'mr-2';
    icon.innerHTML = type === 'success' ? '✓' : '✗';

    const text = document.createElement('span');
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('opacity-0', 'translate-x-8');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-8');
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 3000);
  }
};

// Cart Actions - Event handlers and business logic
const cartActions = {
  // Cart operations
  async loadCart() {
    const response = await cartAPI.getCart();

    if (response.success) {
      cartUI.renderCartItems(response.cart, response.coupons);
    } else {
      cartUI.renderEmptyCart();
      cartUI.showToast('Failed to load cart', 'error');
    }
  },

  async addToCart(productId) {
    const response = await cartAPI.addToCart(productId);

    if (response.success) {
      cartUI.showToast('Product added to cart');
      this.loadCart();
    } else {
      cartUI.showToast('Failed to add product', 'error');
    }
  },

  async incrementItem(productId) {
    const response = await cartAPI.addToCart(productId);
    console.log(response)

    if (response.success) {
      this.loadCart();
    } else {
      cartUI.showToast('Failed to update quantity', 'error');
    }
  },

  async decrementItem(productId) {
    const response = await cartAPI.decrementItem(productId);

    if (response.success) {
      this.loadCart();
    } else {
      cartUI.showToast('Failed to update quantity', 'error');
      console.log(response)
    }
  },

  async deleteItem(productId) {
    const response = await cartAPI.deleteItem(productId);

    if (response.success) {
      this.loadCart();
    } else {
      cartUI.showToast('Failed to remove item', 'error');
    }
  },

  // Checkout flow
  async proceedToCheckout() {
    const response = await cartAPI.proceedToCheckout();

    if (response.success) {
      if (response.address && response.address.length > 0) {
        cartUI.renderAddressList(response.address);
      } else {
        // No addresses found, show add new address form
        if (response.userId) {
          cartUI.renderAddNewAddressForm(response.userId);
        } else {
          cartUI.showToast('User ID not found', 'error');
        }
      }
    } else {
      cartUI.showToast('Failed to proceed to checkout', 'error');
    }
  },

  // Address management
  selectAddressUI(element, addressId) {
    // Remove previous selection styling
    document.querySelectorAll('[data-id]').forEach(el => {
      el.classList.remove('ring-2', 'ring-blue-500');
    });

    // Uncheck all radio buttons
    document.querySelectorAll('input[name="selectedAddress"]').forEach(input => {
      input.checked = false;
    });

    // Select the clicked address
    const radio = element.querySelector('input[name="selectedAddress"]');
    if (radio) {
      radio.checked = true;
      element.classList.add('ring-2', 'ring-blue-500');
    }
  },

  async editAddress(addressId) {
    const response = await cartAPI.getAddress(addressId);

    if (response.success) {
      cartUI.renderAddressEditForm(response.address);
    } else {
      cartUI.showToast('Failed to load address details', 'error');
    }
  },

  async deleteAddress(addressId) {
    if (confirm('Are you sure you want to delete this address?')) {
      const response = await cartAPI.deleteAddress(addressId);

      if (response.success) {
        cartUI.showToast('Address deleted successfully');
        this.proceedToCheckout();
      } else {
        cartUI.showToast('Failed to delete address', 'error');
      }
    }
  },

  addNewAddress(userId) {
    cartUI.renderAddNewAddressForm(userId);
  },

  async submitAddressUpdate(event, addressId) {
    event.preventDefault();
    const form = event.target;

    if (!cartUI.validateAddressForm(form)) {
      return;
    }

    const addressData = {
      housename: form.housename.value.trim(),
      city: form.city.value.trim(),
      street: form.street.value.trim(),
      state: form.state.value.trim(),
      postalCode: form.postalCode.value.trim(),
      label: form.addressType.value
    };

    const response = await cartAPI.updateAddress(addressId, addressData);

    if (response.success) {
      cartUI.showToast('Address updated successfully');
      this.proceedToCheckout();
    } else {
      cartUI.showToast('Failed to update address', 'error');
    }
  },

  async submitNewAddress(event, userId) {
    event.preventDefault();
    const form = event.target;

    if (!cartUI.validateAddressForm(form)) {
      return;
    }

    const addressData = {
      housename: form.housename.value.trim(),
      city: form.city.value.trim(),
      street: form.street.value.trim(),
      state: form.state.value.trim(),
      postalCode: form.postalCode.value.trim(),
      label: form.addressType.value
    };

    const response = await cartAPI.saveNewAddress(userId, addressData);

    if (response.success) {
      cartUI.showToast('Address added successfully');
      this.proceedToCheckout();
    } else {
      cartUI.showToast('Failed to add address', 'error');
    }
  },

  // Handle address selection and continue to payment
  async continueWithSelectedAddress() {
    const selectedRadio = document.querySelector('input[name="selectedAddress"]:checked');

    if (!selectedRadio) {
      cartUI.showToast('Please select an address', 'error');
      return;
    }

    const addressId = selectedRadio.value;
    const response = await cartAPI.selectAddress(addressId);

    if (response.success) {
      cartUI.renderPaymentOptions(response.orderId);
    } else {
      cartUI.showToast('Failed to proceed with selected address', 'error');
    }
  },

  // Payment processing
  async processPayment() {
    const form = document.getElementById('paymentForm');
    if (!form) {
      cartUI.showToast('Payment form not found', 'error');
      return;
    }

    const formData = new FormData(form);
    const paymentMethod = formData.get('paymentMethod');
    const orderId = formData.get('orderId');

    if (!paymentMethod || !orderId) {
      cartUI.showToast('Payment method or order ID missing', 'error');
      return;
    }

    const response = await cartAPI.placeOrder(paymentMethod, orderId);

    if (response.success) {
      console.log(response)
      if (paymentMethod === 'cod') {
        // Cash on delivery - redirect to success page
        window.location.href = '/order-success';
      } else if (response.razorpayOrderId) {
        // Online payment - initialize payment gateway
        this.initializeRazorpay(response);
      }
    } else {
      cartUI.showToast('Failed to place order', 'error');
    }
  },

  initializeRazorpay(paymentData) {
  const options = {
    key: paymentData.key,
    amount: paymentData.amount,
    currency: 'INR',
    order_id: paymentData.razorpayOrderId,
    handler: async (response) => {
      // Verify payment on callback
      const verifyData = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        orderId: paymentData.orderId
      };

      const verifyResponse = await cartAPI.verifyPayment(verifyData);

      if (verifyResponse.success) {
        window.location.href = '/order-success';
      } else {
        window.location.href = '/order-failed';
      }
    },
    modal: {
      ondismiss: function () {
        window.location.href = '/order-failed';
      }
    },
    theme: { color: '#3399cc' }
  };

  try {
    const rzp = new Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('Razorpay initialization failed:', error);
    cartUI.showToast('Payment gateway initialization failed', 'error');
  }
}
,
  // Wishlist actions
  async addToWishlist(productId) {
    const response = await cartAPI.addToWishlist(productId);

    if (response.success) {
      cartUI.showToast('Added to wishlist');
    } else {
      cartUI.showToast('Failed to add to wishlist', 'error');
    }
  }
};

// Initialize the cart
document.addEventListener('DOMContentLoaded', () => {
  cartActions.loadCart();
});

function applyCoupon() {

  const orderIdInput = document.querySelector('input[name="orderId"]');
  const orderId = orderIdInput ? orderIdInput.value : null;

  const couponCode = document.getElementById("couponCode");
  const code = couponCode.value.trim();
  console.log("applied coupon - ", code);

  fetch("/checkcoupon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, orderId })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        cartUI.renderOrderSummary(data.totalItems, data.totalPrice, data.grandTotal)
        const processButton = document.getElementById("processButton")
        processButton.classList.add("hidden")

        const processButton2 = document.getElementById("processButton2")
        processButton2.classList.remove("hidden")

        const couponLabel = document.getElementById("couponLabel")
        couponLabel.innerText = data.message;
        couponLabel.style.color = "green"
      } else {
        const couponLabel = document.getElementById("couponLabel")
        couponLabel.innerText = data.message;
        couponLabel.style.color = "red"
      }
    })
}

async function checkOutFinal() {

  const form = document.getElementById("paymentForm")
  const formData = new FormData(form);
  const paymentMethod = formData.get('paymentMethod');

  const orderIdInput = document.querySelector('input[name="orderId"]');
  const orderId = orderIdInput ? orderIdInput.value : null;
  const response = await cartAPI.placeOrder(paymentMethod, orderId);

  if (response.success) {
    if (paymentMethod === 'cod') {
      // Cash on delivery - redirect to success page
      window.location.href = '/order-success';
    } else if (response.razorpayOrderId) {
      // Online payment - initialize payment gateway
      cartActions.initializeRazorpay(response);
    }
  } else {
    cartUI.showToast('Failed to place order', 'error');
  }
  // fetch("/place-order", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({paymentMethod, orderId})
  // })
}