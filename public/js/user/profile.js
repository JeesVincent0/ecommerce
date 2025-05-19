

//@desc disable side button color
function hideMyProfileButton() {
    const categoryButton = document.getElementById("myProfileButton");
    categoryButton.classList.remove("bg-gray-400");
}

function hideAddressButton() {
    const productsButton = document.getElementById("addressButton")
    productsButton.classList.remove("bg-gray-400")
}

function hideOrderButton() {
    const usersButton = document.getElementById("orderButton");
    usersButton.classList.remove("bg-gray-400");

}

//@desc Enable side button color
function addMyProfileButton() {
    const categoryButton = document.getElementById("myProfileButton");
    categoryButton.classList.add("bg-gray-400");
}

function addAddressButton() {
    const productsButton = document.getElementById("addressButton")
    productsButton.classList.add("bg-gray-400")
}

function addOrderButton() {
    const usersButton = document.getElementById("orderButton");
    usersButton.classList.add("bg-gray-400");

}

myProfile()
//this function is for render my profile section
function myProfile() {

    //changing side bar button color
    addMyProfileButton()
    hideAddressButton()
    hideOrderButton()

    fetch("/myprofile", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            renderMyProfile(data.user)
        })
}

//this function is for render address section
function address() {

    //changing side bar button color
    addAddressButton()
    hideMyProfileButton()
    hideOrderButton()
}

//this function is for render orders section
function order() {

    //changing side bar button color
    addOrderButton()
    hideMyProfileButton()
    hideAddressButton()
}

function accessMainSection() {
    const mainSecion = document.getElementById("profileSecion")
    mainSecion.innerHTML = "";
    return mainSecion
}

function accessAddressSection() {
    const addressSection = document.getElementById("addressSection")
    addressSection.innerHTML = "";
    return addressSection
}

function accessHeading() {
    const heading = document.getElementById("heading");
    heading.innerHTML = "";
    return heading
}

//this function is for render user details in my profile section
function renderMyProfile(user) {

    //access sections render page
    const mainSecion = accessMainSection()
    const addressSection = accessAddressSection()
    const heading = accessHeading()

    heading.innerHTML = "My Pofile"

    mainSecion.innerHTML = `
                            <div class="max-w-xl mx-auto mt-3 space-y-6 text-gray-800">
                            <!-- Profile Image -->
<div class="flex justify-center">
  <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-300">
    <img src="http://localhost:3000/user/${user.email}/profile-pic" 
         alt="Profile" 
         class="w-full h-full object-cover" />
  </div>
</div>
                            <!-- User Info -->
                            <div class="space-y-4">
                                <div class="flex items-center">
                                    <label class="w-24 font-medium">Name:</label>
                                    <div class="flex-1 bg-gray-200 px-3 py-1 rounded-md">${user.name}</div>
                                </div>

                                <div class="flex items-center">
                                    <label class="w-24 font-medium">Email:</label>
                                    <div class="flex-1 bg-gray-200 px-3 py-1 rounded-md">${user.email}
                                    </div>
                                </div>

                                <div class="flex items-center">
                                    <label class="w-24 font-medium">Phone:</label>
                                    <div class="flex-1 bg-gray-200 px-3 py-1 rounded-md">${user.phone ? user.phone : "Not added"}</div>
                                </div>
                            </div>
                        </div>
                        <button onclick="changePassword()"
                         class="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm">
                         Change password
                         </button>
                         <button onclick="editProfile()"
                         class="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm">
                         Edit profile
                        </button>`
    user.addresses.forEach(address => {
        addressSection.innerHTML += `
                        <div class="space-y-3 mt-6 p-3 m-10 relative">
  <div class="bg-white rounded-2xl shadow-lg p-6 relative border border-gray-200">
    <h2 class="text-lg font-semibold mb-4 text-gray-700">Shipping Address</h2>
    
    <div class="mb-3">
      <label class="text-sm text-gray-500">House Name</label>
      <div class="text-gray-800 font-medium">${address.housename}</div>
    </div>

    <div class="flex justify-between gap-4 mb-3">
      <div class="w-1/2">
        <label class="text-sm text-gray-500">City</label>
        <div class="text-gray-800 font-medium">${address.city}</div>
      </div>
      <div class="w-1/2">
        <label class="text-sm text-gray-500">Street</label>
        <div class="text-gray-800 font-medium">${address.street}</div>
      </div>
    </div>

    <div class="flex justify-between gap-4 mb-3">
      <div class="w-1/2">
        <label class="text-sm text-gray-500">State</label>
        <div class="text-gray-800 font-medium">${address.state}</div>
      </div>
      <div class="w-1/2">
        <label class="text-sm text-gray-500">Pin</label>
        <div class="text-gray-800 font-medium">${address.postalCode}</div>
      </div>
    </div>

    <div class="mb-4">
      <label class="text-sm text-gray-500">Address Type</label>
      <div class="text-blue-600 font-semibold">${address.label}</div>
    </div>

    <!-- Aligned Buttons -->
    <div class="absolute bottom-4 right-4 flex gap-3">
      <button onclick="getOneAddress('${address._id}')"
        class="bg-blue-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
        Edit
      </button>
      <button onclick="deleteAddress('${address._id}')"
        class="bg-red-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400">
        Delete
      </button>
    </div>
  </div>
</div>


`
    });
    addressSection.innerHTML += `
<button onclick="addNewAddress('${user._id}')"
 class="space-y-3 mt-6 border p-3 m-10 relative bg-green-500 hover:bg-green-600 text-white py-3 rounded-md text-sm">
    Add Address
</button>
`;
}

function editProfile() {
    fetch("/myprofile", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                renderEditProfile(data.user)
            }
        })
}

function renderEditProfile(user) {

    const mainSecion = accessMainSection()

    mainSecion.innerHTML = `
    <form id="editProfileForm" class="space-y-6">
  <h2 class="text-xl font-semibold text-gray-800 text-center">Edit Profile</h2>

  <!-- Profile Picture -->
  <div class="flex items-center space-x-4">
    <img id="previewImage" src="http://localhost:3000/user/${user.email}/profile-pic" alt="Profile" class="w-16 h-16 rounded-full object-cover">
    <input type="file" id="profilePic" name="profilePic" accept="image/*"
           class="text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
  </div>

  <!-- Name -->
  <div>
    <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
    <input type="text" name="name" id="name" placeholder="${user.name}"
           class="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>

  <!-- Email -->
  <div>
    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
    <input type="email" name="email" id="email"  placeholder="${user.email}"
           class="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>

  <!-- Phone Number -->
  <div>
    <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
    <input type="number" name="phone" id="phone"  placeholder="${user.phone}"
           class="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>

  <!-- Submit Button -->
  <div>
    <button type="submit"
            class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
      Save Changes
    </button>
  </div>
</form>
`

    document.getElementById('profilePic').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('previewImage').src = URL.createObjectURL(file);
        }
    });

    document.getElementById('editProfileForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        fetch('/edit-profile', {
            method: 'PATCH',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    myProfile()
                }
            })
            .catch(err => {
                console.error("Error:", err);
            });
    });

}

function changePassword() {
    const heading = accessHeading();
    heading.innerHTML = "Change or Create new password";

    const mainSecion = accessMainSection();

    mainSecion.innerHTML = `<!-- Loading Overlay -->
<div id="loaderOverlay" class="inset-0 bg-[#EDEDED] bg-opacity-40 flex items-center justify-center z-50">
    <div class="w-16 h-16 border-4 border-white border-t-blue-500 rounded-full animate-spin"></div>
</div>`


    fetch("/sendotp", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                mainSecion.innerHTML = `
  <form class="space-y-4">
    
<!-- OTP with Verify Button -->
<div>
  <label for="otp" id="otpLabel" class="block text-sm font-medium text-gray-700">OTP</label>
  <div class="mt-1 flex space-x-2">
    <input type="text" name="otp" id="otp" autocomplete="new-password" required
           class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
    <button type="button" onclick="verifyOtp()"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
      Verify
    </button>
  </div>
</div>

    
    <!-- New Password -->
    <div>
      <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
      <input type="password" name="newPassword" id="newPassword" autocomplete="new-password" required disabled
             class="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    
    <!-- Confirm Password -->
    <div>
      <label for="confirmPassword" class="block text-sm font-medium text-gray-700" id="passwordLabel">Confirm New Password</label>
      <input type="password" name="confirmPassword" id="confirmPassword" autocomplete="new-password" required disabled
             class="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    
    <!-- Submit Button -->
    <div>
      <button type="button" onclick="submitNewPassword()"
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
        Change Password
      </button>
    </div>
    
  </form>
`
            }
        })

}

function verifyOtp() {
    const otp = document.getElementById("otp").value

    fetch("/otpVerify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp })
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                document.getElementById("otpLabel").innerText = "Succes"
                document.getElementById("otpLabel").style.color = "green"
                document.getElementById("newPassword").disabled = false;
                document.getElementById("confirmPassword").disabled = false;
            } else {
                document.getElementById("otpLabel").innerText = "Wrong OTP"
                document.getElementById("otpLabel").style.color = "red"
            }
        })
}

function submitNewPassword() {
    const otp = document.getElementById("otp").value.trim()
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        document.getElementById("passwordLabel").innerText = "New password not matcing";
        document.getElementById("passwordLabel").style.color = "red";
        return
    }

    fetch("/changepassword", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, otp })
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                myProfile()
            } else {
                document.getElementById("otpLabel").innerText = "Wrong OTP"
                document.getElementById("otpLabel").style.color = "red"
            }
        })
        .catch((error) => console.log(error.toString()))
}

function getOneAddress(userId) {
    fetch(`/getaddress/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                renderAddressEditForm(data.address)
            }
        })
}

function renderAddressEditForm(address) {
    const addressSection = accessAddressSection()
    addressSection.innerHTML = `
    <form class="space-y-3 mt-6 border p-3 m-10 relative bg-white rounded-md shadow-sm"
      onsubmit="submitAddress(event, '${address._id}')">

  <div>
    <label id="label-housename" for="housename" class="text-sm text-gray-600">House Name:</label>
    <input type="text" name="housename" id="housename" value="${address.housename}" 
           class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
  </div>

  <div>
    <label id="label-city" for="city" class="text-sm text-gray-600">City:</label>
    <input type="text" name="city" id="city" value="${address.city}" 
           class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
  </div>

  <div>
    <label id="label-street" for="street" class="text-sm text-gray-600">Street:</label>
    <input type="text" name="street" id="street" value="${address.street}" 
           class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
  </div>

  <div class="flex space-x-4">
    <div class="flex-1">
      <label id="label-state" for="state" class="text-sm text-gray-600">State:</label>
      <input type="text" name="state" id="state" value="${address.state}" 
             class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
    </div>
    <div class="flex-1">
      <label id="label-postalCode" for="postalCode" class="text-sm text-gray-600">Pin:</label>
      <input type="text" name="postalCode" id="postalCode" value="${address.postalCode}" 
             class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
    </div>
  </div>

  <div>
    <label id="label-addressType" for="addressType" class="text-sm text-gray-600">Label (e.g., Home, Office):</label>
    <select id="addressType" name="addressType" 
            class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
      <option value="">Select</option>
      <option value="home" ${address.label === "home" ? "selected" : ""}>Home</option>
      <option value="office" ${address.label === "office" ? "selected" : ""}>Office</option>
    </select>
  </div>

  <div class="flex justify-end">
    <button type="submit"
            class="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-md">
      Save Updates
    </button>
  </div>
</form>
`
}

function submitAddress(event, userId) {
  event.preventDefault();
  const form = event.target;
  let isValid = true;

  const fields = [
    { name: "housename", label: "label-housename", display: "House Name" },
    { name: "city", label: "label-city", display: "City" },
    { name: "street", label: "label-street", display: "Street" },
    { name: "state", label: "label-state", display: "State" },
    { name: "postalCode", label: "label-postalCode", display: "Pin" },
    { name: "addressType", label: "label-addressType", display: "Label" },
  ];

  fields.forEach(field => {
    const input = form[field.name];
    const label = document.getElementById(field.label);

    if (!input.value.trim()) {
      label.innerText = `${field.display} is required`;
      label.style.color = "red";
      input.classList.add("border", "border-red-500");
      isValid = false;
    } else {
      label.innerText = `${field.display}:`;
      label.style.color = "#4B5563"; // text-gray-600
      input.classList.remove("border", "border-red-500");
    }
  });

  if (!isValid) return;

  const data = {
    housename: form.housename.value.trim(),
    city: form.city.value.trim(),
    street: form.street.value.trim(),
    state: form.state.value.trim(),
    postalCode: form.postalCode.value.trim(),
    label: form.addressType.value.trim()
  };

  fetch(`/update-address/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        myProfile();
      }
    });
}


function addNewAddress(userId) {
    console.log(userId)
    const addressSection = accessAddressSection()

    addressSection.innerHTML = `
    <form class="space-y-3 mt-6 border p-3 m-10 relative bg-white rounded-md shadow-sm"
      onsubmit="saveAddress(event,'${userId}')">

  <div>
    <label id="label-housename" for="housename" class="text-sm text-gray-600">House Name:</label>
    <input type="text" name="housename" id="housename" 
           class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
  </div>

  <div>
    <label id="label-city" for="city" class="text-sm text-gray-600">City:</label>
    <input type="text" name="city" id="city" 
           class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
  </div>

  <div>
    <label id="label-street" for="street" class="text-sm text-gray-600">Street:</label>
    <input type="text" name="street" id="street" 
           class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
  </div>

  <div class="flex space-x-4">
    <div class="flex-1">
      <label id="label-state" for="state" class="text-sm text-gray-600">State:</label>
      <input type="text" name="state" id="state" 
             class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
    </div>
    <div class="flex-1">
      <label id="label-postalCode" for="postalCode" class="text-sm text-gray-600">Pin:</label>
      <input type="text" name="postalCode" id="postalCode" 
             class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
    </div>
  </div>

  <div>
    <label id="label-addressType" for="addressType" class="text-sm text-gray-600">Label (e.g., Home, Office):</label>
    <select id="addressType" name="addressType" 
            class="w-full bg-gray-200 px-3 py-2 rounded-md outline-none">
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
</form>
`
}

function saveAddress(event, userId) {
    event.preventDefault();
    const form = event.target;

    // Helper to set error message
    const setError = (id, message) => {
        const label = document.getElementById(`label-${id}`);
        label.textContent = message;
        label.style.color = "red";
    };

    // Helper to reset label
    const clearError = (id, originalText) => {
        const label = document.getElementById(`label-${id}`);
        label.textContent = originalText;
        label.style.color = "";
    };

    // Reset all labels
    clearError("housename", "House Name:");
    clearError("city", "City:");
    clearError("street", "Street:");
    clearError("state", "State:");
    clearError("postalCode", "Pin:");
    clearError("addressType", "Label (e.g., Home, Office):");

    let isValid = true;

    // Validate each field
    if (!form.housename.value.trim()) {
        setError("housename", "Enter house name");
        isValid = false;
    }

    if (!form.city.value.trim()) {
        setError("city", "Enter city");
        isValid = false;
    }

    if (!form.street.value.trim()) {
        setError("street", "Enter street");
        isValid = false;
    }

    if (!form.state.value.trim()) {
        setError("state", "Enter state");
        isValid = false;
    }

    if (!form.postalCode.value.trim()) {
        setError("postalCode", "Enter pin");
        isValid = false;
    } else if (!/^\d{6}$/.test(form.postalCode.value.trim())) {
        setError("postalCode", "Pin must be 6 digits");
        isValid = false;
    }

    if (!form.addressType.value) {
        setError("addressType", "Select address type");
        isValid = false;
    }

    if (!isValid) return;

    const data = {
        housename: form.housename.value.trim(),
        city: form.city.value.trim(),
        street: form.street.value.trim(),
        state: form.state.value.trim(),
        postalCode: form.postalCode.value.trim(),
        label: form.addressType.value
    };

    fetch(`/save-address/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            myProfile();
        }
    });
}



function getWallet() {
    fetch("get-wallet", {
        method: "GET"
    })
        .then((res) => res.json())
        .then((data) => {
            wallet(data.wallet)
        })
}


function wallet(wallet) {
    hideMyProfileButton();

    const mainSection = accessMainSection();
    const addressSection = accessAddressSection();
    const heading = accessHeading();

    heading.innerHTML = "My Wallet";
    addressSection.classList.add("hidden");

    // Calculate total credits and debits
    const totalCredits = wallet.transactions
        .filter(tx => tx.type === 'credit')
        .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalDebits = wallet.transactions
        .filter(tx => tx.type === 'debit')
        .reduce((sum, tx) => sum + tx.amount, 0);

    mainSection.innerHTML = `
    <div class="p-6 space-y-8">
        <!-- Wallet Card -->
        <div class="relative bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 shadow-lg overflow-hidden">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-20 -mr-20"></div>
            <div class="relative z-10">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-white">Wallet Balance</h2>
                    <div class="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                        <span class="text-white text-sm">Available</span>
                    </div>
                </div>
                <div class="mb-6">
                    <span class="text-3xl font-bold text-white">₹${wallet.balance.toLocaleString('en-IN')}</span>
                </div>
                <div class="flex items-center justify-between text-white text-sm">
                    <div>
                        <div class="text-white opacity-80">Total Added</div>
                        <div class="font-semibold">₹${totalCredits.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                        <div class="text-white opacity-80">Total Spent</div>
                        <div class="font-semibold">₹${totalDebits.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Transaction Controls -->
        <div class="flex flex-wrap gap-4">
            <button onclick="showAddFundsModal()" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg shadow flex items-center justify-center gap-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Add Money
            </button>
            <button onclick="showTransactionHistory()" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg shadow flex items-center justify-center gap-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zm0 4a1 1 0 000 2h5a1 1 0 000-2H3zm0 4a1 1 0 100 2h4a1 1 0 100-2H3zm10 5a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" clip-rule="evenodd" />
                </svg>
                View All
            </button>
        </div>

        <!-- Transaction Summary -->
        <div>
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-800">Recent Transactions</h3>
                <div class="flex gap-2">
                    <button onclick="filterTransactions('all')" class="text-xs bg-blue-100 text-blue-800 py-1 px-3 rounded-full filter-btn active">All</button>
                    <button onclick="filterTransactions('credit')" class="text-xs bg-gray-100 text-gray-800 py-1 px-3 rounded-full filter-btn">Added</button>
                    <button onclick="filterTransactions('debit')" class="text-xs bg-gray-100 text-gray-800 py-1 px-3 rounded-full filter-btn">Spent</button>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <ul id="transactionsList" class="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    ${wallet.transactions.slice().reverse().slice(0, 10).map(tx => `
                        <li class="transaction-item p-4 hover:bg-gray-50 transition-colors" data-type="${tx.type}">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="flex-shrink-0">
                                        <div class="w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                                            ${tx.type === 'credit' ? 
                                                `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 2H8.828a2 2 0 00-1.414.586L6.293 3.707A1 1 0 015.586 4H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                                                </svg>` : 
                                                `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
                                                </svg>`
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-gray-900">
                                            ${tx.reason}
                                        </p>
                                        <div class="flex items-center">
                                            ${tx.orderId ? 
                                                `<span class="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5 mr-2">Order #${tx.orderId.toString().slice(-6)}</span>` : 
                                                ''}
                                            <span class="text-xs text-gray-500">${new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at ${new Date(tx.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <span class="${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'} font-medium">
                                    ${tx.type === 'credit' ? '+' : '-'}₹${tx.amount.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </li>
                    `).join('')}
                </ul>
                ${wallet.transactions.length > 10 ? 
                    `<div class="text-center p-4 border-t">
                        <button onclick="showTransactionHistory()" class="text-blue-600 text-sm font-medium hover:text-blue-800">
                            View All Transactions
                        </button>
                    </div>` : 
                    wallet.transactions.length === 0 ? 
                    `<div class="text-center p-6 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>No transactions found</p>
                    </div>` : 
                    ''
                }
            </div>
        </div>
    </div>

    <!-- Add Money Modal (hidden by default) -->
    <div id="addFundsModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center hidden">
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Add Money to Wallet</h3>
                <button onclick="closeAddFundsModal()" class="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Enter Amount (₹)</label>
                    <input type="number" id="addAmount" min="1" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter amount">
                </div>
                <div class="flex gap-2 flex-wrap">
                    <button onclick="quickAddAmount(100)" class="quick-amount-btn bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded">
                        ₹100
                    </button>
                    <button onclick="quickAddAmount(500)" class="quick-amount-btn bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded">
                        ₹500
                    </button>
                    <button onclick="quickAddAmount(1000)" class="quick-amount-btn bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded">
                        ₹1,000
                    </button>
                    <button onclick="quickAddAmount(2000)" class="quick-amount-btn bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded">
                        ₹2,000
                    </button>
                </div>
                <button onclick="processAddFunds()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
                    Proceed to Payment
                </button>
            </div>
        </div>
    </div>

    <!-- All Transactions Modal (hidden by default) -->
    <div id="allTransactionsModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center hidden">
        <div class="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
            <div class="p-4 border-b flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">Transaction History</h3>
                <button onclick="closeTransactionHistory()" class="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="p-4 border-b bg-gray-50">
                <div class="flex flex-wrap gap-4 items-center justify-between">
                    <div class="flex gap-2">
                        <button onclick="filterAllTransactions('all')" class="text-sm bg-blue-100 text-blue-800 py-1 px-4 rounded-full all-filter-btn active">All</button>
                        <button onclick="filterAllTransactions('credit')" class="text-sm bg-gray-100 text-gray-800 py-1 px-4 rounded-full all-filter-btn">Added</button>
                        <button onclick="filterAllTransactions('debit')" class="text-sm bg-gray-100 text-gray-800 py-1 px-4 rounded-full all-filter-btn">Spent</button>
                    </div>
                    <div class="relative">
                        <input type="text" id="searchTransactions" placeholder="Search transactions" class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>
            
            <div class="overflow-y-auto flex-1">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date & Time
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reference
                            </th>
                            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200" id="allTransactionsList">
                        ${wallet.transactions.slice().reverse().map(tx => `
                            <tr class="all-transaction-item hover:bg-gray-50" data-type="${tx.type}" data-reason="${tx.reason.toLowerCase()}">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    <div class="text-xs text-gray-400">
                                        ${new Date(tx.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">${tx.reason}</div>
                                    <div class="text-xs text-gray-500">${tx.type === 'credit' ? 'Money Added' : 'Money Spent'}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${tx.orderId ? `Order #${tx.orderId.toString().slice(-6)}` : '-'}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}">
                                    ${tx.type === 'credit' ? '+' : '-'}₹${tx.amount.toLocaleString('en-IN')}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${wallet.transactions.length === 0 ? 
                    `<div class="text-center p-12 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p class="text-lg">No transactions found</p>
                    </div>` : 
                    ''
                }
            </div>
        </div>
    </div>
    `;

    // Add event listeners for the search functionality
    setTimeout(() => {
        const searchInput = document.getElementById('searchTransactions');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const allItems = document.querySelectorAll('#allTransactionsList .all-transaction-item');
                
                allItems.forEach(item => {
                    const reason = item.getAttribute('data-reason');
                    if (reason.includes(searchTerm)) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        }
    }, 100);
}

// Add these utility functions for handling modals and filters

function showAddFundsModal() {
    const modal = document.getElementById('addFundsModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('addAmount').focus();
    }
}

function closeAddFundsModal() {
    const modal = document.getElementById('addFundsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function quickAddAmount(amount) {
    const input = document.getElementById('addAmount');
    if (input) {
        input.value = amount;
    }
}

function processAddFunds() {
    const amount = document.getElementById('addAmount').value;
    if (!amount || parseFloat(amount) <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    // Here you would integrate with your payment gateway
    // After successful payment, update the wallet and close modal
    closeAddFundsModal();
    
    // For demonstration purposes:
    alert(`Payment gateway would process ₹${amount} here`);
    // After payment is complete, you'd refresh the wallet data
    // getWalletData(); // This function would fetch updated wallet data
}

function showTransactionHistory() {
    const modal = document.getElementById('allTransactionsModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeTransactionHistory() {
    const modal = document.getElementById('allTransactionsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function filterTransactions(type) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active', 'bg-blue-100', 'text-blue-800'));
    buttons.forEach(btn => btn.classList.add('bg-gray-100', 'text-gray-800'));
    
    const clickedButton = document.querySelector(`.filter-btn:nth-child(${type === 'all' ? 1 : type === 'credit' ? 2 : 3})`);
    if (clickedButton) {
        clickedButton.classList.remove('bg-gray-100', 'text-gray-800');
        clickedButton.classList.add('active', 'bg-blue-100', 'text-blue-800');
    }
    
    const items = document.querySelectorAll('#transactionsList .transaction-item');
    items.forEach(item => {
        if (type === 'all' || item.getAttribute('data-type') === type) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

function filterAllTransactions(type) {
    const buttons = document.querySelectorAll('.all-filter-btn');
    buttons.forEach(btn => btn.classList.remove('active', 'bg-blue-100', 'text-blue-800'));
    buttons.forEach(btn => btn.classList.add('bg-gray-100', 'text-gray-800'));
    
    const clickedButton = document.querySelector(`.all-filter-btn:nth-child(${type === 'all' ? 1 : type === 'credit' ? 2 : 3})`);
    if (clickedButton) {
        clickedButton.classList.remove('bg-gray-100', 'text-gray-800');
        clickedButton.classList.add('active', 'bg-blue-100', 'text-blue-800');
    }
    
    const items = document.querySelectorAll('#allTransactionsList .all-transaction-item');
    items.forEach(item => {
        if (type === 'all' || item.getAttribute('data-type') === type) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}


function deleteAddress(addressId) {
    fetch(`/address/${addressId}`, {
        method: "DELETE"
    })
    .then((res) => res.json())
    .then((data) => {
        if(data.success) {
            myProfile();
        }
    })
}