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
      <td class="px-6 py-4 ${product.isActive ? 'text-green-600' : 'text-red-600'}">
        ${product.isActive ? 'Active' : 'Blocked'}
      </td>
      <td class="px-6 py-4 space-x-1">
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs">View</button>
        
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
  const searchKey = document.getElementById("searchInput").value.trim()
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
  const searchInput = document.getElementById("searchInput");
  const clearButton = document.getElementById("clearSearchButton1");

  if (searchInput.value.trim() !== "") {
    clearButton.classList.remove("hidden");
  } else {
    clearButton.classList.add("hidden");
  }
}

//this function will inoke and render user after clicking the clear button
function clearSearchProduct() {
  const searchInput = document.getElementById("searchInput");
  searchInput.value = "";
  toggleClearButtonProducts();
  loadProducts()
}

function addProduct() {
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
  setupImageUploadValidation();

}


let selectedFiles = [];

function setupImageUploadValidation() {
  const imageInput = document.getElementById("imageUpload");
  const previewContainer = document.getElementById("imagePreview");
  const uploadError = document.getElementById("uploadError");

  imageInput.addEventListener("change", function () {
    const newFiles = Array.from(imageInput.files);

    for (const file of newFiles) {
      // Max image count check
      if (selectedFiles.length >= 4) {
        uploadError.innerText = "You can only upload up to 4 images.";
        return;
      }

      // File size check (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        uploadError.innerText = `File "${file.name}" is too large. Max 2MB allowed.`;
        return;
      }

      // Check if the file is already added
      if (selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
        return;
      }

      // Create a URL for the selected file
      const imageURL = URL.createObjectURL(file);

      // Create an image element
      const img = new Image();
      img.src = imageURL;

      // When image is loaded
      img.onload = () => {
        const ratio = img.width / img.height;
        // Check if the image is square (aspect ratio 1:1)
        if (ratio < 0.95 || ratio > 1.05) {
          uploadError.innerText = `File "${file.name}" must be square (1:1).`;
          return;
        }

        // Add the file to the selected files array
        selectedFiles.push(file);

        // Create a preview wrapper element
        const wrapper = document.createElement("div");
        wrapper.className = "relative";

        // Create the image element
        const imageElement = document.createElement("img");
        imageElement.src = imageURL;
        imageElement.className = "w-24 h-24 object-cover rounded-lg border";

        // Create a remove button
        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = "&times;";
        removeBtn.className = "absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs";
        removeBtn.onclick = () => {
          // Remove the image from the selectedFiles array and remove from DOM
          selectedFiles = selectedFiles.filter(f => f !== file);
          wrapper.remove();
        };

        // Append image and remove button to wrapper
        wrapper.appendChild(imageElement);
        wrapper.appendChild(removeBtn);

        // Append the preview wrapper to the container
        previewContainer.appendChild(wrapper);
      };
    }

    // Clear the file input field after processing
    imageInput.value = "";
  });
}


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
</form>`;

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

let selectedFiles1 = []; // Can contain both URL strings and File objects

function setupImageUploadValidation1(existingImages = []) {
  const imageInput = document.getElementById("imageUploadEdit");
  const previewContainer = document.getElementById("imagePreview");
  const uploadError = document.getElementById("uploadError");

  // Load existing images from backend
  existingImages.forEach(url => {
    selectedFiles1.push(url); // Just store the URL
    renderImagePreview(url);
  });

  imageInput.addEventListener("change", function () {
    uploadError.innerText = "";
    const newFiles = Array.from(imageInput.files);

    for (const file of newFiles) {
      if (selectedFiles1.length >= 4) {
        uploadError.innerText = "You can only upload up to 4 images.";
        break;
      }

      if (file.size > 2 * 1024 * 1024) {
        uploadError.innerText = `File "${file.name}" is too large. Max 2MB allowed.`;
        continue;
      }

      if (selectedFiles1.find(f => typeof f !== "string" && f.name === file.name && f.size === file.size)) {
        continue;
      }

      const imageURL = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageURL;

      img.onload = () => {
        const ratio = img.width / img.height;
        if (ratio < 0.95 || ratio > 1.05) {
          uploadError.innerText = `File "${file.name}" must be square (1:1).`;
          return;
        }

        selectedFiles1.push(file);
        renderImagePreview(imageURL, file);
      };
    }

    imageInput.value = "";
  });

  function renderImagePreview(src, file = null) {
    const wrapper = document.createElement("div");
    wrapper.className = "relative";

    const imageElement = document.createElement("img");
    imageElement.src = src;
    imageElement.className = "w-24 h-24 object-cover rounded-lg border";

    const removeBtn = document.createElement("button");
    removeBtn.innerHTML = "&times;";
    removeBtn.className = "absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs";

    removeBtn.onclick = () => {
      selectedFiles1 = selectedFiles1.filter(f => {
        if (file) return f !== file; // Remove uploaded File
        return f !== src; // Remove backend URL
      });
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
