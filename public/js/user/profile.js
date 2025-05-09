

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
                        <div class="space-y-3 mt-6 border p-3 m-10 relative">
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
    <!-- Address Type -->
    <div class="flex items-center space-x-6 mt-4">
        <span class="ml-2">${address.label}</span>
    </div>

    <!-- Edit Button -->
    <button onclick="getOneAddress('${address._id}')" type="button"
     class="absolute bottom-3 right-3 bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
        Edit
    </button>
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
        headers: { "Content-Type" : "application/json" }
    })
    .then((res) => res.json())
    .then((data) => {
        if(data.success) {
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
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    })
    .catch(err => {
      console.error("Error:", err);
      alert("Something went wrong.");
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
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if(newPassword !== confirmPassword ) {
        document.getElementById("passwordLabel").innerText = "New password not matcing";
        document.getElementById("passwordLabel").style.color = "red";
        return
    }

    fetch("/changepassword", {
        method: "PATCH",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify({ newPassword })
    })
    .then((res) => res.json())
    .then((data) => {
        if(data.success) {
            myProfile()
        }
    })
    .catch((error) => console.log(error.toString()))
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
    const addressSection = accessAddressSection()
    addressSection.innerHTML = `
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
            myProfile()
        }
    });
}

function addNewAddress(userId) {
    console.log(userId)
    const addressSection = accessAddressSection()
    
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
            myProfile()
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
  addressSection.classList.add("hidden"); // Hide address section if needed

  mainSection.innerHTML = `
    <div class=" p-6 space-y-6">
      <!-- Wallet Balance -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800">Wallet Balance</h2>
        <span class="text-2xl font-semibold text-green-600">₹${wallet.balance}</span>
      </div>

      <!-- Recent Transactions -->
      <div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Recent Transactions</h3>
        <ul class="space-y-2 max-h-60 overflow-y-auto pr-2">
          ${wallet.transactions.slice().reverse().map(tx => `
            <li class="flex items-center justify-between border rounded-lg p-3 bg-gray-50">
              <div>
                <p class="text-sm text-gray-800 font-medium">
                  ${tx.reason} ${tx.orderId ? `( #${tx.orderId.toString().slice(-6)} )` : ""}
                </p>
                <p class="text-xs text-gray-500">${new Date(tx.date).toLocaleString()}</p>
              </div>
              <span class="${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'} font-semibold text-sm">
                ${tx.type === 'credit' ? '+' : '-'}₹${tx.amount}
              </span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
}
