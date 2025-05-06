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

    console.log("myProfile called")

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
                                <div class="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                                    <svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path
                                            d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
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

    addressSection.innerHTML += `
                        <div class="space-y-3 mt-6 border p-3 m-10">
                        <div>
                            <label class="text-sm text-gray-600">House Name:</label>
                            <div class="bg-gray-200 px-3 py-2 rounded-md">Kollamnakudiyil house</div>
                        </div>
                        <div>
                            <label class="text-sm text-gray-600">City:</label>
                            <div class="bg-gray-200 px-3 py-2 rounded-md">Muvattupuzha</div>
                        </div>
                        <div>
                            <label class="text-sm text-gray-600">Town:</label>
                            <div class="bg-gray-200 px-3 py-2 rounded-md">Vazhakulam</div>
                        </div>

                        <div class="flex space-x-4">
                            <div>
                                <label class="text-sm text-gray-600">State:</label>
                                <div class="bg-gray-200 px-3 py-2 rounded-md">Kerala</div>
                            </div>
                            <div>
                                <label class="text-sm text-gray-600">Pin:</label>
                                <div class="bg-gray-200 px-3 py-2 rounded-md">686672</div>
                            </div>
                        </div>
                        <!-- Address Type -->
                        <div class="flex items-center space-x-6 mt-4">
                            <label class="inline-flex items-center">
                                <input type="radio" name="addressType" class="form-radio" checked>
                                <span class="ml-2">Home</span>
                            </label>
                            <label class="inline-flex items-center">
                                <input type="radio" name="addressType" class="form-radio">
                                <span class="ml-2">Office</span>
                            </label>
                        </div>
                    </div>`
}

function editProfile() {

    const mainSecion = accessMainSection()

    mainSecion.innerHTML = `
    <form class="space-y-6">
  <h2 class="text-xl font-semibold text-gray-800 text-center">Edit Profile</h2>

  <!-- Profile Picture -->
  <div class="flex items-center space-x-4">
    <img id="previewImage" src="/images/googleLogo.png" alt="Profile" class="w-16 h-16 rounded-full object-cover">
    <input type="file" id="profilePic" name="profilePic" accept="image/*"
           class="text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
  </div>

  <!-- Name -->
  <div>
    <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
    <input type="text" name="name" id="name" required
           class="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>

  <!-- Email -->
  <div>
    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
    <input type="email" name="email" id="email" required
           class="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>

  <!-- Phone Number -->
  <div>
    <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
    <input type="tel" name="phone" id="phone" required pattern="[0-9]{10}"
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
    console.log(otp)

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