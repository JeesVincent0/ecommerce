
function productList() {

  //hide other section
  hideUserSection();
  hideCategoryList();
  hideEditCategorySection();
  hideAddCategorySection();

  //changing side button color
  hideCategoryButton();
  hideUserButton();

  const productListingSection = document.getElementById("productListingSection");
  productListingSection.classList.remove("hidden")

  const productmainsection = document.getElementById("productmainsection")
  productmainsection.classList.remove("hidden")

  const productListingSection1 = document.getElementById("categoriesContainer2");
  productListingSection1.classList.add("hidden")


  loadProducts()
}

function loadProducts(page = 1, limit = 8) {
  fetch(`/products?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })
    .then((res) => res.json())
    .then((data) => {
      renderProducts(data.product)
      productPagination(data.totalPages, page, loadProducts)
    })
}

function renderProducts(products) {
  console.log(products)
  const container = document.getElementById("productTableBody");
  container.innerHTML = "";

  products.forEach(product => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="px-6 py-4">
        <img src="${product.images[0]}" alt="Product" class="w-12 h-12 object-cover rounded">
      </td>
      <td class="px-6 py-4">${product.product_name}</td>
      <td class="px-6 py-4">${product.category}</td>
      <td class="px-6 py-4">₹${product.mrp}</td>
      <td class="px-6 py-4">₹${product.last_price}</td>
      <td class="px-6 py-4 text-green-600">${product.discount_percentage}%</td>
      <td class="px-6 py-4">${product.stock}</td>
      <td class="px-6 py-4">
  <button 
    onclick="toggleProductStatus('${product._id}', ${product.isActive})"
    class="px-4 py-1 rounded-md text-white text-sm 
           ${product.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}">
    ${product.isActive ? 'Block' : 'Unblock'}
  </button>
</td>

      <td class="px-6 py-4 space-x-1">
        <button onclick="editProduct('${product._id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs">Edit</button>
        
      </td>
    `;
    container.appendChild(row);
  });
}


function productPagination(totalPages, currentPage, callback) {

  const pagination = document.getElementById("paginationContainer2");
  pagination.innerHTML = "";
  if (currentPage > 1) {
    pagination.innerHTML += `<button onclick="${callback.name}(${currentPage - 1})" class="ml-3 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">&laquo; Prev</button>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `<button onclick="${callback.name}(${i})" class="ml-3 px-3 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">${i}</button>`;
  }

  if (currentPage < totalPages) {
    pagination.innerHTML += `<button onclick="${callback.name}(${currentPage + 1})" class="ml-3 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Next &raquo;</button>`;
  }
}

async function toggleProductStatus(productId, currentStatus) {
  const confirmAction = confirm(`Are you sure you want to ${currentStatus ? 'block' : 'unblock'} this product?`);
  if (!confirmAction) return;

  try {
    const response = await fetch(`/admin/products/${productId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isActive: !currentStatus })
    });

    const result = await response.json();
    if (result.success) {
      alert(`Product has been ${!currentStatus ? 'unblocked' : 'blocked'} successfully.`);
      location.reload(); // or update UI without reloading
    } else {
      alert(result.message || 'Something went wrong');
    }
  } catch (err) {
    console.error(err);
    alert('Server error');
  }
}

// function addSearchAndButtons1() {

//   //Accessing navbar search div
//   const searchBarContainer = document.getElementById("searchBarContainer");

//   //setting html content
//   searchBarContainer.innerHTML = "";
//   searchBarContainer.innerHTML = `<div class="flex items-center space-x-2 mr-4 relative">
//             <span class="hidden" id="searchSpan"></span>
//              <button
//                 id="addButton"  
//                 onclick="addProduct()"
//                 class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
//             >
//                 Add </button>
//             <input 
//                 id="searchInput" 
//                 type="text" 
//                 placeholder="Search..."
//                 oninput="toggleClearButtonProducts()" 
//                 class="bg-white px-3 py-1 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8" 
//             />
            
//             <!-- Clear Button -->
//             <button 
//                 id="clearSearchButton" 
//                 onclick="clearSearchProduct()" 
//                 class="absolute right-28 text-gray-500 hover:text-gray-700 hidden"
//                 style="font-size: 18px;"
//             >
//                 &times;
//             </button>
    
//             <button  
//                 onclick="productSearch()"
//                 class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
//             >
//                 Search
//             </button>
                       
            
//         </div>
//     `;
// }

//this function for search bar for user search
function productSearch(page = 1, limit = 9) {
  const searchKey = document.getElementById("searchInputPro").value.trim()
  console.log("category search", searchKey)

  fetch(`/products/search?key=${searchKey}&page=${page}&limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data)
      renderProducts(data.product)
      productPagination(data.totalPages, page, productSearch)
    })
    .catch((error) => console.log(error.message))
}

//this button function is for search clear button
function toggleClearButtonProducts() {
  const searchInput = document.getElementById("searchInputPro");
  const clearButton = document.getElementById("clearSearchButton1");

  if (searchInput.value.trim() !== "") {
    clearButton.classList.remove("hidden");
  } else {
    clearButton.classList.add("hidden");
  }
}

//this function will inoke and render user after clicking the clear button
function clearSearchProduct() {
  const searchInput = document.getElementById("searchInputPro");
  searchInput.value = "";
  toggleClearButtonProducts();
  loadProducts()
}

function addProduct() {
    const productListingSection1 = document.getElementById("categoriesContainer2");
  productListingSection1.classList.remove("hidden")
  const productmainsection = document.getElementById("productmainsection")
  productmainsection.classList.add("hidden")
  const pagination = document.getElementById("paginationContainer2");
  pagination.innerHTML = "";
  const searchBarContainer = document.getElementById("searchBarContainer");
  searchBarContainer.innerHTML = "";
  const productListingSection = document.getElementById("categoriesContainer2");
  productListingSection.innerHTML = `<form id="addProductForm" class="space-y-4" action="/product/add" method="POST" enctype="multipart/form-data">
  
  <div id="productNameInput">
    <div class="relative">
      <label class="block text-sm font-medium text-gray-700">Product Name</label>
      <input type="text" id="productName" name="product_name"
        class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter Product Name" required>
    </div>
  </div>

  <div id="productDescriptionInput">
    <label class="block text-sm font-medium text-gray-700">Product Description</label>
    <textarea id="productDescription" name="description"
      class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      placeholder="Enter Description" 
      oninput="limitWords(this, 100)" required></textarea>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700">Brand</label>
    <input type="text" name="brand"
      class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter Brand Name" required>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700">MRP (₹)</label>
    <input type="number" name="mrp"
      class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter MRP" required>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700">Discount Price (₹)</label>
    <input type="number" name="discount_price"
      class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter Discount Price" required>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700">Stock</label>
    <input type="number" name="stock"
      class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter Stock Quantity" required>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700">Tags (Comma Separated)</label>
    <input type="text" name="tags"
      class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="e.g., casual, denim, summer">
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700">Select Category</label>
    <select name="category_slug" id="productCategory"
      class="mt-2 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
      <option value="">Select Category</option>
      <div id="categoryCanteiner"></div>

      <!-- Add dynamic options here -->
    </select>
  </div>

<div>
  <label class="block text-sm font-medium text-gray-700">Upload Product Images (4 Images)</label>
  <input type="file" name="images" id="imageUpload" multiple accept="image/*"
    class="mt-2 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>

  <small class="text-gray-500 block mt-1">Max 4 images. Max 2MB each. Must be square (1:1)</small>

  <div id="imagePreview" class="mt-4 flex flex-wrap gap-4"></div>
  <div id="uploadError" class="text-red-500 mt-2 text-sm"></div>
</div>



  <button type="button" onclick="saveProduct()" 
    class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
    Save Product
  </button>

</form>`

  const categoryCanteiner = document.getElementById("categoryCanteiner")
  categoryCanteiner.innerHTML = "";


  fetch("/product/category", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data)
      if (data.categoyNames) {
        let categories = Array.isArray(data.categoyNames) ? data.categoyNames : [data.categoyNames]
        console.log(categories)
        categories.forEach(category => {
          categoryCanteiner.innerHTML += `<option value="${category.slug}">${category.slug}</option>`
        });
      }
    })
  document.addEventListener("DOMContentLoaded", function () {
  setupImageUploadValidation();
});
}

  let selectedFiles = [];

  function setupImageUploadValidation() {
    const imageInput = document.getElementById("imageUpload");
    const previewContainer = document.getElementById("imagePreview");
    const uploadError = document.getElementById("uploadError");

    imageInput.addEventListener("change", function () {
      const newFiles = Array.from(imageInput.files);

      newFiles.forEach((file) => {
        if (selectedFiles.length >= 4) {
          uploadError.innerText = "You can only upload up to 4 images.";
          return;
        }

        if (file.size > 2 * 1024 * 1024) {
          uploadError.innerText = `File "${file.name}" is too large. Max 2MB allowed.`;
          return;
        }

        if (selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
          return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
          const img = new Image();
          img.src = e.target.result;

          img.onload = function () {
            const minSize = Math.min(img.width, img.height);
            const cropX = (img.width - minSize) / 2;
            const cropY = (img.height - minSize) / 2;

            const canvas = document.createElement("canvas");
            canvas.width = 300; // output size (square)
            canvas.height = 300;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(
              img,
              cropX, cropY, minSize, minSize, // source crop
              0, 0, 300, 300                  // destination size
            );

            canvas.toBlob((blob) => {
              const croppedFile = new File([blob], file.name, { type: "image/jpeg" });
              selectedFiles.push(croppedFile);

              const imageURL = URL.createObjectURL(blob);

              const wrapper = document.createElement("div");
              wrapper.className = "relative";

              const imageElement = document.createElement("img");
              imageElement.src = imageURL;
              imageElement.className = "w-24 h-24 object-cover rounded-lg border";

              const removeBtn = document.createElement("button");
              removeBtn.innerHTML = "&times;";
              removeBtn.className = "absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs";
              removeBtn.onclick = () => {
                selectedFiles = selectedFiles.filter(f => f !== croppedFile);
                wrapper.remove();
              };

              wrapper.appendChild(imageElement);
              wrapper.appendChild(removeBtn);
              previewContainer.appendChild(wrapper);
            }, "image/jpeg", 0.9);
          };
        };

        reader.readAsDataURL(file);
      });

      imageInput.value = "";
    });
  }

  window.onload = setupImageUploadValidation;





function saveProduct() {
  const form = document.getElementById("addProductForm");
  const formData = new FormData(form);

  // Append images from selectedFiles
  selectedFiles.forEach(file => {
    formData.append("images", file);
  });

  fetch("/product/add", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      alert("Product added successfully!");
      selectedFiles = [];  // Clear after successful submit
      loadProducts();
    })
    .catch(err => {
      console.error(err);
    });
}

function editProduct(productId) {
  fetch(`/product/${productId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => {
      renderEditForm(data.product); // Render form with existing product data
    })
    .catch((error) => console.log(error.message));
}

function renderEditForm(product) {
  console.log("edit form reached")
      const productListingSection1 = document.getElementById("categoriesContainer2");
  productListingSection1.classList.remove("hidden")
  const productmainsection = document.getElementById("productmainsection")
  productmainsection.classList.add("hidden")
  const pagination = document.getElementById("paginationContainer2");
  pagination.innerHTML = "";
  const searchBarContainer = document.getElementById("searchBarContainer");
  searchBarContainer.innerHTML = "";
  const container = document.getElementById("categoriesContainer2");

  console.log("product details for editing form", product)

  container.innerHTML = `
    <form id="editProductForm" class="space-y-4" enctype="multipart/form-data">
  
  <!-- Hidden Product ID -->
  <input type="hidden" name="id" value="${product._id}" />

  <!-- Product Name -->
  <div>
    <label class="block text-sm font-medium text-gray-700">Product Name</label>
    <input type="text" name="product_name" value="${product.product_name}"
      class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      required>
  </div>

  <!-- Description -->
  <div>
    <label class="block text-sm font-medium text-gray-700">Product Description</label>
    <textarea name="description"
      class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      required oninput="limitWords(this, 100)">${product.description}</textarea>
  </div>

  <!-- Brand -->
  <div>
    <label class="block text-sm font-medium text-gray-700">Brand</label>
    <input type="text" name="brand" value="${product.brand}"
      class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      required>
  </div>

  <!-- MRP -->
  <div>
    <label class="block text-sm font-medium text-gray-700">MRP (₹)</label>
    <input type="number" name="mrp" value="${product.mrp}"
      class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      required>
  </div>

  <!-- Discount Price -->
  <div>
    <label class="block text-sm font-medium text-gray-700">Discount Price (₹)</label>
    <input type="number" name="discount_price" value="${product.discount_price}"
      class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      required>
  </div>

  <!-- Stock -->
  <div>
    <label class="block text-sm font-medium text-gray-700">Stock</label>
    <input type="number" name="stock" value="${product.stock}"
      class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      required>
  </div>

  <!-- Tags -->
  <div>
    <label class="block text-sm font-medium text-gray-700">Tags (Comma Separated)</label>
    <input type="text" name="tags" value="${product.tags?.join(', ')}"
      class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
  </div>

  <!-- Category -->
  <div>
    <label class="block text-sm font-medium text-gray-700">Select Category</label>
    <select name="category_slug"
      class="mt-2 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
      <option value="${product.slug}" selected>${product.slug}</option>
      <div id="optiosContainer">
      <!-- Inject other category options dynamically -->
      </div>
    </select>
  </div>

<!-- Image Upload -->
<div>
  <label class="block text-sm font-medium text-gray-700">Replace Product Images (optional)</label>
  
  <!-- File Input -->
  <input id="imageUploadEdit" type="file" name="images" multiple accept="image/*"
    class="mt-2 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">

  <!-- Instructions -->
  <small class="text-gray-500 block mt-1">
    Max 4 images. Max 2MB each. Must be square (1:1)
  </small>

  <!-- Error Message -->
  <div id="uploadError" class="text-red-500 text-sm mt-1"></div>

  <!-- Preview Container -->
  <div id="imagePreview" class="mt-4 flex flex-wrap gap-4">
    <!-- Images will be injected here -->
  </div>
</div>


  <!-- Submit Button -->
  <button type="button" onclick="saveProduct1()"
    class="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
    Update Product
  </button>
</form>


`;

  const categoryCanteiner = document.getElementById("optiosContainer")
  categoryCanteiner.innerHTML = "";


  fetch("/product/category", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data)
      if (data.categoyNames) {
        let categories = Array.isArray(data.categoyNames) ? data.categoyNames : [data.categoyNames]
        console.log(categories)
        categories.forEach(category => {
          if (category.slug !== product.slug) {
            categoryCanteiner.innerHTML += `<option value="${category.slug}">${category.slug}</option>`
          }
        });
      }
    })

  setupImageUploadValidation1(product.images)
}

let selectedFiles1 = []; // Holds both existing URL strings and { file, previewUrl } objects

function setupImageUploadValidation1(existingImages = []) {
  const imageInput = document.getElementById("imageUploadEdit");
  const previewContainer = document.getElementById("imagePreview");
  const uploadError = document.getElementById("uploadError");
  const cropperModal = document.getElementById("cropperModal");
  const cropperImage = document.getElementById("cropperImage");
  const cancelCrop = document.getElementById("cancelCrop");
  const confirmCrop = document.getElementById("confirmCrop");

  let cropper;
  selectedFiles1 = [];
  previewContainer.innerHTML = "";

  // Load existing images
  existingImages.forEach(url => {
    selectedFiles1.push(url); // Keep as URL string
    renderImagePreview(url, true);
  });

  imageInput.addEventListener("change", function () {
    uploadError.innerText = "";
    const newFiles = Array.from(imageInput.files);
    let currentIndex = 0;

    function processNextImage() {
      if (currentIndex >= newFiles.length) {
        imageInput.value = ""; // Reset input
        return;
      }

      const file = newFiles[currentIndex++];

      if (selectedFiles1.length >= 4) {
        uploadError.innerText = "You can only upload up to 4 images.";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        uploadError.innerText = `File "${file.name}" is too large. Max 2MB allowed.`;
        processNextImage();
        return;
      }

      // Avoid duplicates
      const isDuplicate = selectedFiles1.some(f =>
        typeof f !== "string" &&
        f.file.name === file.name &&
        f.file.size === file.size
      );
      if (isDuplicate) {
        processNextImage();
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        cropperImage.src = reader.result;
        cropperModal.classList.remove("hidden");

        cropperImage.onload = () => {
          cropper = new Cropper(cropperImage, {
            aspectRatio: 1,
            viewMode: 1,
          });
        };

        cancelCrop.onclick = () => {
          cropper.destroy();
          cropper = null;
          cropperModal.classList.add("hidden");
          processNextImage();
        };

        confirmCrop.onclick = () => {
          const canvas = cropper.getCroppedCanvas({
            width: 500,
            height: 500,
          });

          canvas.toBlob((blob) => {
            if (blob.size > 2 * 1024 * 1024) {
              uploadError.innerText = `Cropped image is too large. Max 2MB allowed.`;
              cropper.destroy();
              cropperModal.classList.add("hidden");
              processNextImage();
              return;
            }

            const croppedFile = new File([blob], file.name, { type: blob.type });
            const previewUrl = URL.createObjectURL(croppedFile);

            selectedFiles1.push({ file: croppedFile, previewUrl });
            renderImagePreview(previewUrl, false);

            cropper.destroy();
            cropperModal.classList.add("hidden");
            processNextImage();
          }, "image/jpeg");
        };
      };
      reader.readAsDataURL(file);
    }

    processNextImage(); // Start processing
  });

  function renderImagePreview(src, isExisting = false) {
    const wrapper = document.createElement("div");
    wrapper.className = "relative";

    const imageElement = document.createElement("img");
    imageElement.src = src;
    imageElement.className = "w-24 h-24 object-cover rounded-lg border";

    const removeBtn = document.createElement("button");
    removeBtn.innerHTML = "&times;";
    removeBtn.className =
      "absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs";

    removeBtn.onclick = () => {
      if (isExisting) {
        selectedFiles1 = selectedFiles1.filter(f => f !== src);
      } else {
        selectedFiles1 = selectedFiles1.filter(f => f.previewUrl !== src);
        URL.revokeObjectURL(src);
      }
      wrapper.remove();
    };

    wrapper.appendChild(imageElement);
    wrapper.appendChild(removeBtn);
    previewContainer.appendChild(wrapper);
  }
}



function saveProduct1() {
  const form = document.getElementById("editProductForm");
  const formData = new FormData(form);

  // Append images from selectedFiles
  selectedFiles1.forEach(file => {
    formData.append("images", file);
  });

  fetch("/product/edit", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      alert("Product added successfully!");
      selectedFiles1 = [];  // Clear after successful submit
      loadProducts();
    })
    .catch(err => {
      console.error(err);
    });
}

function deleteProduct(id) {

  const result = window.confirm("Are you sure you want to delete this product?");

  if (result) {
    console.log("hello this function is for delete files", id)
    fetch(`/product/delete/${id}`, {
      method: "DELETE",
    })
      .then(res => res.json())
      .then(data => {  // Clear after successful submit
        loadProducts();
      })
      .catch(err => {
        console.error(err);
      });
  }
}

let currentSortKey = '';
let currentSortDirection = 'asc';

function sortProducts(key) {
  // Toggle direction if sorting the same key
  if (currentSortKey === key) {
    currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    currentSortKey = key;
    currentSortDirection = 'asc';
  }

  // Sort the global products array
  products.sort((a, b) => {
    let valA = a[key];
    let valB = b[key];

    // Convert strings to lowercase for consistent sorting
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Update sort icon
  updateSortIcons(key, currentSortDirection);

  // Re-render table
  renderProducts(products);
}

function updateSortIcons(key, direction) {
  const columns = ['name', 'category', 'mrp', 'lastPrice', 'discount', 'stock', 'isActive'];
  columns.forEach(col => {
    const icon = document.getElementById(`sort-icon-${col}`);
    if (icon) icon.textContent = col === key ? (direction === 'asc' ? '▲' : '▼') : '⇅';
  });
}
