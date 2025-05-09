
function addToCart(productId) {
    fetch(`/add-to-cart/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                alert("Product added to cart")
            }
        })
        .catch((error) => console.log(error.toString()));
}

getCart();
function getCart() {
    fetch("/get-cart", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                renderCartCard(data.cart)
            }
        })
}

function accessCartSection() {
    const cartSection = document.getElementById("cartSection");
    cartSection.innerHTML = "";
    return cartSection
}
function accessSideSection() {
    const sideSection = document.getElementById("sideSection");
    sideSection.innerHTML = ""
    return sideSection
}

function renderCartCard(cart) {
    let totalPrice = 0;
    let totalItems = 0;

    const cartSection = accessCartSection();
    const sideSection = accessSideSection();


    cart.items.forEach(cart => {
        cartSection.innerHTML += `
        <div class="flex items-center gap-4 p-4 border rounded-md shadow-sm bg-white mb-4 max-w-3xl mx-auto">
        <!-- Product Image -->
        <img src="http://localhost:3000/${cart.productId.images[0]}" alt="Product Name" class="w-24 h-24 object-cover rounded-md" />

        <!-- Product Info -->
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-800">${cart.productId.product_name}</h3>
          <p class="text-sm text-gray-500">Price: ₹${cart.priceAtTime}</p>
        </div>

        <!-- Quantity Control -->
        <div class="flex items-center gap-2">
          <button onclick="decrement('${cart.productId._id}')" class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">-</button>
          <span class="px-3">${cart.quantity}</span>
          <button onclick="increment('${cart.productId._id}')" class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">+</button>
        </div>

        <!-- Total Price -->
        <div class="w-28 text-right">
          <p class="font-medium">₹${(cart.quantity) * (cart.priceAtTime)}</p>
        </div>

        <!-- Remove Button -->
        <button onclick="deleteItem('${cart.productId._id}')" class="ml-4 text-red-500 hover:text-red-700">
          🗑️
        </button>
      </div>`

        totalItems += cart.quantity;
        totalPrice += ((cart.quantity) * (cart.priceAtTime))
    });

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

        <hr class="my-3" />

        <!-- Total -->
        <div class="flex justify-between text-md font-semibold text-gray-800 mb-4">
          <span>Total Amount</span>
          <span>₹${totalPrice}</span>
        </div>

        <!-- Checkout Button -->
        <button id="processButton" onclick="proceedCheckout()" class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
          Proceed to Checkout
        </button>
      </div>`
}

function increment(productId) {
    fetch(`/add-to-cart/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                getCart();
            }
        })
}

function decrement(productId) {
    fetch(`/decrement-cart/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                getCart();
            }
        })
}

function deleteItem(productId) {
    fetch(`/delete-item/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                getCart()
            }
        })
}

function proceedCheckout() {
    fetch("/checkout", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                renderAddress(data.address);
                const processButton = document.getElementById("processButton");
                processButton.onclick = sendSelectedAddressToServer;
            } else {
                alert(data.message)
            }
        })
}

function sendSelectedAddressToServer() {
    const selected = document.querySelector("input[name='selectedAddress']:checked");
    
    if (!selected) {
        alert("Please select an address before continuing.");
        return;
    }

    const addressId = selected.value;

    fetch("/select-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            renderPaymentPage(data.orderId)
            const processButton = document.getElementById("processButton");
            processButton.onclick = placeOrder;
        } else {
            alert(data.message || "Something went wrong");
        }
    });
}

function placeOrder() {
    const form = document.getElementById("paymentForm");
    const formData = new FormData(form);
    const paymentMethod = formData.get("paymentMethod");
    const orderId = formData.get("orderId");

    if (!paymentMethod || !orderId) {
        alert("Please select payment method or address.");
        return;
    }

    fetch("/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, orderId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Order placed successfully!");
                window.location.href = "/orders"; 
            } else {
                alert(data.message || "Order failed.");
            }
        });
}


function renderPaymentPage(orderId) {
    console.log(orderId);
    const processButton = document.getElementById("processButton");
    processButton.innerHTML = "Place order";

    const cartSection = accessCartSection();
    cartSection.innerHTML = `
<form id="paymentForm" class="max-w-md mx-auto mt-6 p-6 bg-white rounded-2xl shadow space-y-5">
  <h2 class="text-2xl font-semibold text-gray-800">Select Payment Method</h2>

  <!-- Hidden orderId input -->
  <input type="hidden" name="orderId" value="${orderId}">

  <div class="space-y-4">

    <!-- COD (Enabled) -->
    <label class="flex items-center p-4 border-2 border-green-500 rounded-xl cursor-pointer hover:bg-green-50">
      <input type="radio" name="paymentMethod" value="cod" class="form-radio text-green-600" checked>
      <span class="ml-3 font-medium text-gray-800">Cash on Delivery (COD)</span>
    </label>

    <!-- Razorpay (Disabled) -->
    <label class="flex items-center p-4 border rounded-xl bg-gray-100 cursor-not-allowed opacity-60">
      <input type="radio" name="paymentMethod" value="razorpay" class="form-radio" disabled>
      <span class="ml-3 text-gray-500">Razorpay (Coming Soon)</span>
    </label>

    <!-- Google Pay (Disabled) -->
    <label class="flex items-center p-4 border rounded-xl bg-gray-100 cursor-not-allowed opacity-60">
      <input type="radio" name="paymentMethod" value="googlepay" class="form-radio" disabled>
      <span class="ml-3 text-gray-500">Google Pay (Coming Soon)</span>
    </label>

    <!-- Paytm (Disabled) -->
    <label class="flex items-center p-4 border rounded-xl bg-gray-100 cursor-not-allowed opacity-60">
      <input type="radio" name="paymentMethod" value="paytm" class="form-radio" disabled>
      <span class="ml-3 text-gray-500">Paytm (Coming Soon)</span>
    </label>
  </div>
</form>
`;
}



function renderAddress(addresses) {
    const cartSection = accessCartSection();
    const processButton = document.getElementById("processButton");
    processButton.classList.remove("hidden")
    processButton.innerText = "Continue..."

    addresses.forEach((address, index) => {
        const isChecked = index === 0 ? "checked" : "";
        const ringClass = index === 0 ? "ring-2 ring-blue-500" : "";

        cartSection.innerHTML += `
        <div onclick="selectAddress(this, '${address._id}')" 
            class="space-y-3 mt-6 border p-3 m-10 relative bg-white rounded-md shadow-sm cursor-pointer transition duration-200 hover:shadow-lg ${ringClass}" 
            data-id="${address._id}">
    
            <input type="radio" name="selectedAddress" value="${address._id}" class="hidden" ${isChecked} />
    
            <div>
                <label class="text-sm text-gray-600">House Name:</label>
                <div class="bg-gray-200 px-3 py-2 rounded-md">${address.housename}</div>
            </div>
            <div>
                <label class="text-sm text-gray-600">City:</label>
                <div class="bg-gray-200 px-3 py-2 rounded-md">${address.city}</div>
            </div>
            <div>
                <label class="text-sm text-gray-600">Street:</label>
                <div class="bg-gray-200 px-3 py-2 rounded-md">${address.street}</div>
            </div>
            <div class="flex space-x-4">
                <div>
                    <label class="text-sm text-gray-600">State:</label>
                    <div class="bg-gray-200 px-3 py-2 rounded-md">${address.state}</div>
                </div>
                <div>
                    <label class="text-sm text-gray-600">Pin:</label>
                    <div class="bg-gray-200 px-3 py-2 rounded-md">${address.postalCode}</div>
                </div>
            </div>
            <div class="flex items-center space-x-6 mt-4">
                <span class="ml-2">${address.label}</span>
            </div>
    
            <button onclick="event.stopPropagation(); getOneAddress('${address._id}')" type="button"
                class="absolute bottom-3 right-3 bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Edit
            </button>
        </div>
        `
    });

    cartSection.innerHTML += `
    <button onclick="addNewAddress('${addresses[0].userId}')"
        class="space-y-3 mt-6 border p-3 m-10 relative bg-green-500 hover:bg-green-600 text-white py-3 rounded-md text-sm">
        Add Address
    </button>
    `;
}


function selectAddress(element, id) {
    // Remove previous selection
    document.querySelectorAll("[name='selectedAddress']").forEach(input => {
        input.checked = false;
        input.parentElement.classList.remove('ring-2', 'ring-blue-500');
    });

    // Select new address
    const radio = element.querySelector("input[name='selectedAddress']");
    radio.checked = true;
    element.classList.add('ring-2', 'ring-blue-500');
}

function getOneAddress(userId) {
    fetch(`/getaddress/${userId}`, {
        method: "GET",
        headers: { "Content-Type" : "application/json" }
    })
    .then((res) => res.json())
    .then((data) => {
        if(data.success) {
            renderAddressEditForm(data.address)
        }
    })
}

function renderAddressEditForm(address) {
    const processButton = document.getElementById("processButton");
    processButton.classList.add("hidden")
    const cartSection = accessCartSection();
    cartSection.innerHTML = `
    <form class="space-y-3 mt-6 border p-3 m-10 relative bg-white rounded-md shadow-sm" onsubmit="submitAddress(event,'${address._id}')">
    <div>
        <label class="text-sm text-gray-600">House Name:</label>
        <input type="text" name="housename" value="${address.housename}" 
               class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none" required>
    </div>

    <div>
        <label class="text-sm text-gray-600">City:</label>
        <input type="text" name="city" value="${address.city}" 
               class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none" required>
    </div>

    <div>
        <label class="text-sm text-gray-600">Street:</label>
        <input type="text" name="street" value="${address.street}" 
               class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
    </div>

    <div class="flex space-x-4">
        <div class="flex-1">
            <label class="text-sm text-gray-600">State:</label>
            <input type="text" name="state" value="${address.state}" 
                   class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
        </div>
        <div class="flex-1">
            <label class="text-sm text-gray-600">Pin:</label>
            <input type="text" name="postalCode" value="${address.postalCode}" 
                   class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
        </div>
    </div>

    <div>
        <label class="text-sm text-gray-600">Label (e.g., Home, Office):</label>
               <select id="addressType" name="addressType" class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
                <option value="${address.label}">${address.label}</option>
                <option value="home">Home</option>
                <option value="office">Office</option>
                </select>
    </div>

    <!-- Submit Button -->
    <div class="flex justify-end">
        <button type="submit"
            class="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-md">
            Save updates
        </button>
    </div>
</form>
`
}

function submitAddress(event,userId) {
    event.preventDefault();

    const form = event.target;
    const data = {
        housename: form.housename.value,
        city: form.city.value,
        street: form.street.value,
        state: form.state.value,
        postalCode: form.postalCode.value,
        label: form.addressType.value
    };

    fetch(`/update-address/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            proceedCheckout()
        }
    });
}

function addNewAddress(userId) {
    console.log(userId)
    const addressSection = accessCartSection()
    
    addressSection.innerHTML = `
    <form class="space-y-3 mt-6 border p-3 m-10 relative bg-white rounded-md shadow-sm" onsubmit="saveAddress(event,'${userId}')">
    <div>
        <label class="text-sm text-gray-600">House Name:</label>
        <input type="text" name="housename"  
               class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none" required>
    </div>

    <div>
        <label class="text-sm text-gray-600">City:</label>
        <input type="text" name="city" 
               class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none" required>
    </div>

    <div>
        <label class="text-sm text-gray-600">Street:</label>
        <input type="text" name="street"
               class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
    </div>

    <div class="flex space-x-4">
        <div class="flex-1">
            <label class="text-sm text-gray-600">State:</label>
            <input type="text" name="state" 
                   class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
        </div>
        <div class="flex-1">
            <label class="text-sm text-gray-600">Pin:</label>
            <input type="text" name="postalCode" 
                   class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
        </div>
    </div>

    <div>
        <label class="text-sm text-gray-600">Label (e.g., Home, Office):</label>
               <select id="addressType" name="addressType" class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
                <option value="">Select</option>
                <option value="home">Home</option>
                <option value="office">Office</option>
                </select>
    </div>

    <!-- Submit Button -->
    <div class="flex justify-end">
        <button type="submit"
            class="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-md">
            Save
        </button>
    </div>
</form>`
}

function saveAddress(event,userId) {
    event.preventDefault();

    const form = event.target;
    const data = {
        housename: form.housename.value,
        city: form.city.value,
        street: form.street.value,
        state: form.state.value,
        postalCode: form.postalCode.value,
        label: form.addressType.value
    };

    fetch(`/save-address/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            proceedCheckout()
        }
    });
}