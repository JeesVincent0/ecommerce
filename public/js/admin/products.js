function productList() {

  //Accessing left side button
  const usersButton = document.getElementById("usersButton");
  const categoryButton = document.getElementById("categoryButton");
  const productsButton = document.getElementById("productsButton")

  const productListingSection = document.getElementById("productListingSection");
  productListingSection.classList.remove("hidden")

  //diable category list section
  const maincategeryListSection = document.getElementById("maincategeryListSection");
  maincategeryListSection.classList.add("hidden");

  //disable edit category form
  const editCategoryForm = document.getElementById("maincategeryEditSection")
  editCategoryForm.classList.add("hidden")

  //diable addcategory form section
  const addCategorySection = document.getElementById("maincategeryAddSection")
  addCategorySection.classList.add("hidden")

  //disable serc
  const searchBarContainer = document.getElementById("searchBarContainer");
  searchBarContainer.innerHTML = ""


  //Changing button pressing color
  usersButton.classList.remove("bg-gray-400");
  categoryButton.classList.remove("bg-gray-400");
  productsButton.classList.add("bg-gray-400")
  addSearchAndButtons1()
  loadProducts()
}

function loadProducts(page = 1, limit = 2) {
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

  //getting category listing section
  const categoriesContainer = document.getElementById("categoriesContainer2");
  categoriesContainer.innerHTML = "";

  //loop through categoryies for list cards
  products.forEach(product => {
    categoriesContainer.innerHTML += ` <div class="productCard bg-white p-4 rounded-xl shadow flex flex-wrap items-center justify-between gap-4 hover:shadow-xl hover:scale-101">
  
  <!-- Left Side: Product Info -->
  <div class="text-base sm:text-lg font-semibold min-w-[150px]">
    ${product.product_name} 
    <div class="text-sm font-normal text-gray-600">
      ₹${product.discount_price} 
      <span class="line-through text-gray-400 text-xs">₹${product.mrp}</span>
    </div>
    <div class="text-xs text-green-600 font-medium">
      ${product.discount_percentage}% Off
    </div>
  </div>

  <!-- Right Side: Action Buttons -->
  <div class="flex flex-wrap gap-2 justify-end sm:justify-start">
    <button onclick="editProduct('${product._id}')" class="bg-gray-700 text-white text-sm px-3 py-1 rounded hover:bg-gray-800">
      Edit
    </button>
    <button onclick="deleteProduct('${product._id}')" class="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700">
      Delete
    </button>
  </div>

</div>`
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

function addSearchAndButtons1() {

  //Accessing navbar search div
  const searchBarContainer = document.getElementById("searchBarContainer");

  //setting html content
  searchBarContainer.innerHTML = "";
  searchBarContainer.innerHTML = `<div class="flex items-center space-x-2 mr-4 relative">
            <span class="hidden" id="searchSpan"></span>
             <button
                id="addButton"  
                onclick="addProduct()"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
            >
                Add </button>
            <input 
                id="searchInput" 
                type="text" 
                placeholder="Search..."
                oninput="toggleClearButtonProducts()" 
                class="bg-white px-3 py-1 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8" 
            />
            
            <!-- Clear Button -->
            <button 
                id="clearSearchButton" 
                onclick="clearSearchProduct()" 
                class="absolute right-28 text-gray-500 hover:text-gray-700 hidden"
                style="font-size: 18px;"
            >
                &times;
            </button>
    
            <button  
                onclick="productSearch()"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
            >
                Search
            </button>
                       
            
        </div>
    `;
}

//this function for search bar for user search
function productSearch(page = 1, limit = 2) {
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
  const clearButton = document.getElementById("clearSearchButton");

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


  fetch("/product/category",{
    method: "GET",
    headers: { "Content-Type" : "application/json" }
  })
  .then((res) => res.json())
  .then((data) => {
    console.log(data)
    if(data.categoyNames) {
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
  console.log(selectedFiles)
  const imageInput = document.getElementById("imageUpload");
  const previewContainer = document.getElementById("imagePreview");
  const uploadError = document.getElementById("uploadError");

  imageInput.addEventListener("change", function () {
    const newFiles = Array.from(imageInput.files);

    for (const file of newFiles) {
      // Max image count
      if (selectedFiles.length >= 4) {
        uploadError.innerText = "You can only upload up to 4 images.";
        break;
      }

      // Size check
      if (file.size > 2 * 1024 * 1024) {
        uploadError.innerText = `File "${file.name}" is too large. Max 2MB allowed.`;
        continue;
      }

      // Check if already selected
      if (selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
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

        // Add to custom array
        selectedFiles.push(file);

        // Render preview
        const wrapper = document.createElement("div");
        wrapper.className = "relative";

        const imageElement = document.createElement("img");
        imageElement.src = imageURL;
        imageElement.className = "w-24 h-24 object-cover rounded-lg border";

        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = "&times;";
        removeBtn.className = "absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs";
        removeBtn.onclick = () => {
          selectedFiles = selectedFiles.filter(f => f !== file);
          wrapper.remove();
        };

        wrapper.appendChild(imageElement);
        wrapper.appendChild(removeBtn);
        previewContainer.appendChild(wrapper);
      };
    }

    // Clear input field so user can re-select same files if needed
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


fetch("/product/category",{
  method: "GET",
  headers: { "Content-Type" : "application/json" }
})
.then((res) => res.json())
.then((data) => {
  console.log(data)
  if(data.categoyNames) {
    let categories = Array.isArray(data.categoyNames) ? data.categoyNames : [data.categoyNames]
    console.log(categories)
    categories.forEach(category => {
      if(category.slug !== product.slug) {
        categoryCanteiner.innerHTML += `<option value="${category.slug}">${category.slug}</option>`
      }
    });
  }
})

setupImageUploadValidation(product.images)
}

let selectedFiles1 = []; // Can contain both URL strings and File objects

function setupImageUploadValidation(existingImages = []) {
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