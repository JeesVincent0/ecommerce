

//@desc disable side button color
// function hideMyProfileButton() {
//     const categoryButton = document.getElementById("myProfileButton");
//     categoryButton.classList.remove("bg-gray-400");
// }


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
    hideOrderButton()

    fetch("/myprofile", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            renderMyProfile(data.user, data.coupons)
        })
}

//this function is for render address section
function address() {

    //changing side bar button color
    addAddressButton()
    // hideMyProfileButton()
    hideOrderButton()
}

//this function is for render orders section
function order() {

    //changing side bar button color
    addOrderButton()
    // hideMyProfileButton()
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

const formatDate = (isoString) => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');      // dd
  const month = String(date.getMonth() + 1).padStart(2, '0'); // mm
  const year = String(date.getFullYear()).slice(2);         // yy
  return `${day}-${month}-${year}`;
};

//this function is for render user details in my profile section
function renderMyProfile(user, coupons) {

    //access sections render page
    const mainSecion = accessMainSection()
    const addressSection = accessAddressSection()
    const heading = accessHeading()

    heading.innerHTML = "My Pofile"

    mainSecion.innerHTML = `
                           <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- Profile Section -->
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 backdrop-blur-sm border border-white/20">
            <!-- Profile Header -->
            <div class="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                <!-- Profile Image -->
                <div class="relative">
                    <div class="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 p-1">
                        <div class="w-full h-full rounded-full overflow-hidden bg-white">
                            <img src="http://localhost:3000/user/${user.email}/profile-pic" 
                                 alt="Profile" 
                                 class="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                </div>

                <!-- Profile Info -->
                <div class="flex-1 text-center md:text-left">
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">${user.name}</h1>
                    <p class="text-gray-600 mb-4">Member since 2024</p>
                    
                    <!-- Action Buttons -->
                    <div class="flex flex-wrap gap-3 justify-center md:justify-start">
                        <button onclick="editProfile()"
                                class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                            Edit Profile
                        </button>
                        <button onclick="changePassword()"
                                class="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                            </svg>
                            Change Password
                        </button>
                    </div>
                </div>
            </div>

            <!-- User Details Grid -->
            <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                        <label class="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
                        <div class="text-gray-900 font-medium">${user.email}</div>
                    </div>
                    
                    <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                        <label class="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone Number</label>
                        <div class="text-gray-900 font-medium">${user.phone ? user.phone : "Not provided"}</div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold text-gray-900">Account Status</h3>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span class="text-green-700 font-semibold">Active</span>
                    </div>
                </div>
            </div>
        </div>

<body class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8">
    <!-- Referral Section -->
    <div class="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-white/20 max-w-4xl mx-auto">
        <div class="text-center mb-8">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Share & Earn</h2>
            <p class="text-gray-600 max-w-md mx-auto">Earn rewards when friends join using your link.</p>
        </div>
        

        
        <!-- Loading State -->
        <div id="loadingDiv" class="text-center py-8 hidden">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                <div class="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            </div>
            <p class="text-gray-600 font-medium">Creating your unique referral link...</p>
        </div>
        
        <!-- Referral URL Display -->
        <div id="referralDiv" class="max-w-2xl mx-auto mb-8">
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-green-800">Referral Link Generated!</h3>
                </div>
                
                <div class="bg-white border-2 border-green-200 rounded-lg p-4 mb-4">
                    <code id="referralUrl" class="text-blue-600 text-sm break-all select-all font-mono">${user.referralUrl}</code>
                </div>
                

                <div class="bg-white border-2 border-green-200 rounded-lg p-4 mb-4">
                    <code id="referralCode" class="text-blue-600 text-sm break-all select-all font-mono">${user.referalCode}</code>
                </div>
                

            </div>
            
            <!-- Success Message -->
            <div id="copySuccess" class="text-center p-4 bg-green-100 border border-green-300 rounded-lg hidden">
                <div class="flex items-center justify-center gap-2 text-green-700 font-semibold">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    Link copied to clipboard!
                </div>
            </div>
        </div>

        <!-- Rewards Section -->
        <div class="max-w-4xl mx-auto">
            <div class="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
                <div class="text-center mb-6">
                    <div class="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-orange-800 mb-2">Your Rewards</h3>
                    <p class="text-orange-700">Congratulations! You've earned coupon codes from successful referrals.</p>
                </div>

                <!-- Rewards Summary -->
                <div class="flex justify-center mb-6">
                    <div class="bg-white rounded-lg px-6 py-3 border-2 border-yellow-300 shadow-md">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-orange-600" id="totalRewards">${coupons.length}</div>
                            <div class="text-sm text-gray-600">Total Rewards Earned</div>
                        </div>
                    </div>
                </div>

                <!-- Coupon Cards -->
                <div id="couponContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    
                </div>

            </div>
        </div>
    </div>
    </body>
`
    const couponContainer = document.getElementById("couponContainer");
    couponContainer.innerHTML = "";
    coupons.forEach(coupon => {
        const currentUserId = user._id;

        const applicableUser = coupon.applicableUsers.find(
            u => u.userId === currentUserId
        );

        const startDate = applicableUser.startedDate;
        const expiryDate = applicableUser.expiryDate;
        const limit = applicableUser.limit;

        couponContainer.innerHTML += `
        <!-- Coupon Card 1 -->
        <div class="bg-white rounded-xl shadow-lg border-2 border-yellow-300 overflow-hidden transform hover:scale-105 transition-all duration-200">
            <div class="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2">
                <div class="flex items-center justify-between">
                    <span class="text-white font-bold text-sm">Coupons : ${limit}</span>
                    <div class="w-2 h-6 bg-white rounded-full"></div>
                </div>
            </div>
            <div class="p-4">
                <div class="mb-3">
                    <div class="text-xs text-gray-500 mb-1">Coupon Code</div>
                    <div class="font-mono text-lg font-bold text-gray-800 bg-gray-100 px-3 py-2 rounded-lg text-center">${coupon.code}</div>
                </div>
                <div class="text-xs text-gray-600 mb-3">
                    <div class="flex justify-between mb-1">
                        <span>Offer:</span>
                        <span class="font-semibold">${coupon.discountValue}${coupon.discountType === 'fixed' ? '/-' : '%'}</span>
                    </div>
                    <div class="flex justify-between mb-1">
                        <span>Earned:</span>
                        <span class="font-semibold">${formatDate(startDate)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Expires:</span>
                        <span class="font-semibold text-red-600">${formatDate(expiryDate)}</span>
                    </div>
                </div>
                <button class="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm">
                    Copy Code
                </button>
            </div>
        </div>
        `

    });
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

    setupReferralEventListeners()
}

function setupReferralEventListeners() {
    // Use setTimeout to ensure elements are rendered
    setTimeout(() => {
        const generateBtn = document.getElementById('generateBtn');
        const referralDiv = document.getElementById('referralDiv');
        const referralUrl = document.getElementById('referralUrl');
        const loadingDiv = document.getElementById('loadingDiv');
        const copyBtn = document.getElementById('copyBtn');
        const copySuccess = document.getElementById('copySuccess');

        document.querySelectorAll('#couponContainer button').forEach(button => {
            button.addEventListener('click', function () {
                const couponCode = this.parentElement.querySelector('.font-mono').textContent;
                navigator.clipboard.writeText(couponCode).then(function () {
                    // Change button text temporarily
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    button.classList.add('bg-green-500');
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.classList.remove('bg-green-500');
                    }, 2000);
                });
            });
        });

        // Check if elements exist before adding event listeners
        if (!generateBtn) {
            console.error('generateBtn element not found');
            return;
        }

        generateBtn.addEventListener('click', async function () {

            // Show loading state
            generateBtn.disabled = true;
            generateBtn.innerHTML = `
                <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent inline-block mr-2"></div>
                Generating...
            `;

            if (loadingDiv) loadingDiv.classList.remove('hidden');
            if (referralDiv) referralDiv.classList.add('hidden');

            try {
                const response = await fetch('/profile/referalurl', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (referralUrl) referralUrl.textContent = data.referralUrl;
                    if (referralDiv) referralDiv.classList.remove('hidden');
                } else {
                    throw new Error('Failed to generate referral');
                }
            } catch (error) {

                const mockUrl = `https://yourapp.com/signup?ref=${Math.random().toString(36).substring(7)}`;
                if (referralUrl) referralUrl.textContent = mockUrl;
                if (referralDiv) referralDiv.classList.remove('hidden');
            } finally {
                // Reset button state
                generateBtn.disabled = false;
                generateBtn.innerHTML = `
                    <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Generate Referral Link
                `;
                if (loadingDiv) loadingDiv.classList.add('hidden');
            }
        });

        // Copy button event listener
        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                if (referralUrl) {
                    navigator.clipboard.writeText(referralUrl.textContent).then(function () {
                        if (copySuccess) {
                            copySuccess.classList.remove('hidden');
                            setTimeout(() => {
                                copySuccess.classList.add('hidden');
                            }, 3000);
                        }
                    });
                }
            });
        }
    }, 100); // Small delay to ensure DOM is updated
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
    <div class="max-w-2xl mx-auto">
        <!-- Header Section -->
        <div class="text-center mb-8 animate-fade-in">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Edit Your Profile
            </h1>
            <p class="text-gray-600">Update your personal information and preferences</p>
        </div>

        <!-- Form Container -->
        <div class="glass-effect rounded-2xl shadow-xl border border-white/20 p-8 animate-slide-up">
            <form id="editProfileForm" class="space-y-8">
                
                <!-- Profile Picture Section -->
                <div class="flex flex-col items-center space-y-4">
                    <div class="relative group">
                        <img id="previewImage" 
                             src="http://localhost:3000/user/${user.email}/profile-pic" 
                             alt="Profile" 
                             class="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-white shadow-lg transition-transform group-hover:scale-105">
                        <div class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-center space-y-2">
                        <label for="profilePic" class="cursor-pointer">
                            <span class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg">
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                Change Photo
                            </span>
                        </label>
                        <input type="file" id="profilePic" name="profilePic" accept="image/*" class="hidden" />
                        <p class="text-xs text-gray-500">JPG, PNG or GIF (max. 5MB)</p>
                    </div>
                </div>

                <!-- Form Fields Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <!-- Full Name -->
                    <div class="md:col-span-2">
                        <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">
                            <span class="flex items-center">
                                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                Full Name
                            </span>
                        </label>
                        <input type="text" 
                               name="name" 
                               id="name" 
                               placeholder="${user.name}"
                               class="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 hover:bg-white/90" />
                    </div>

                    <!-- Email -->
                    <div>
                        <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
                            <span class="flex items-center">
                                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                Email Address
                            </span>
                        </label>
                        <input type="email" 
                               name="email" 
                               id="email" 
                               placeholder="${user.email}"
                               class="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 hover:bg-white/90" />
                    </div>

                    <!-- Phone Number -->
                    <div>
                        <label for="phone" class="block text-sm font-semibold text-gray-700 mb-2">
                            <span class="flex items-center">
                                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                                Phone Number
                            </span>
                        </label>
                        <input type="tel" 
                               name="phone" 
                               id="phone" 
                               placeholder="${user.phone}"
                               class="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 hover:bg-white/90" />
                    </div>
                </div>

                <!-- Password Field (Initially Hidden) -->
                <div id="passwordSection" class="hidden">
                    <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                            Current Password
                            <span class="text-red-500 ml-1">*</span>
                        </span>
                    </label>
                    <input type="password" 
                           name="password" 
                           id="password" 
                           placeholder="Enter your current password to change email"
                           class="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder-gray-400" />
                    <p class="text-xs text-red-600 mt-1">Password is required when changing your email address</p>
                </div>

                <!-- Additional Options -->

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-4 pt-6">
                    <button type="button" onclick="myProfile()"
                            class="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
                        Cancel
                    </button>
                    <button type="submit" 
                            class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl">
                        <span class="flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Save Changes
                        </span>
                    </button>
                </div>
            </form>
        </div>

        <!-- Footer Info -->
        <div class="text-center mt-8 text-sm text-gray-500">
            <p>Your information is secure and will never be shared with third parties.</p>
        </div>
    </div>
`

    editImagePreview()

    // Store original email for comparison
    const originalEmail = user.email;

    // Handle profile picture preview
    document.getElementById('profilePic').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('previewImage').src = URL.createObjectURL(file);
        }
    });

    // Monitor email field changes
    document.getElementById('email').addEventListener('input', function (e) {
        const newEmail = e.target.value.trim();
        const passwordSection = document.getElementById('passwordSection');
        const passwordField = document.getElementById('password');
        
        if (newEmail && newEmail !== originalEmail) {
            // Show password field if email is being changed
            passwordSection.classList.remove('hidden');
            passwordField.required = true;
        } else {
            // Hide password field if email is not changed or empty
            passwordSection.classList.add('hidden');
            passwordField.required = false;
            passwordField.value = '';
        }
    });

    // Handle form submission
    document.getElementById('editProfileForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const newEmail = formData.get('email');
        
        // Check if email is being changed and password is required
        if (newEmail && newEmail !== originalEmail) {
            const password = formData.get('password');
            if (!password || password.trim() === '') {
                alert('Password is required when changing your email address.');
                document.getElementById('password').focus();
                return;
            }
        }

        // Add original email to form data for backend reference
        formData.append('originalEmail', originalEmail);

        fetch('/edit-profile', {
            method: 'PATCH',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    myProfile()
                } else {
                    // Handle specific error messages
                    if (data.error === 'Invalid password') {
                        alert('Incorrect password. Please try again.');
                        document.getElementById('password').focus();
                    } else {
                        alert(data.error || 'An error occurred while updating your profile.');
                    }
                }
            })
            .catch(err => {
                console.error("Error:", err);
                alert('Network error. Please try again.');
            });
    });

}

function editImagePreview() {
    // Image preview functionality
    document.getElementById('profilePic').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('previewImage').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Form submission handler
    document.getElementById('editProfileForm').addEventListener('submit', function (e) {
        e.preventDefault();

        // Add loading state to button
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        submitBtn.innerHTML = `
                <span class="flex items-center justify-center">
                    <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                </span>
            `;
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;

            // Show success message (you can customize this)
            // alert('Profile updated successfully!');
        }, 0);
    });

    // Add smooth focus transitions
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('transform', 'scale-105');
        });

        input.addEventListener('blur', function () {
            this.parentElement.classList.remove('transform', 'scale-105');
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
    // hideMyProfileButton();

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
            searchInput.addEventListener('input', function () {
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
    if(confirm("Are you sure to delete this addrees")) {

        fetch(`/address/${addressId}`, {
            method: "DELETE"
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    myProfile();
                }
            })
    }
}