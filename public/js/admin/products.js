
function productList() {

  //hide other section
  hideUserSection();
  hideCategoryList();
  hideEditCategorySection();
  hideAddCategorySection();

  //changing side button color
  hideCategoryButton();
  hideUserButton();

  const orderSection = document.getElementById("orderSection")
  orderSection.classList.add("hidden")

  const container = document.getElementById("categoriesContainer3");
  container.innerHTML = ""

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
  const container = document.getElementById("productTableBody");
  container.innerHTML = "";

  products.forEach(product => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="px-6 py-4">
        <img src="${product.images[0]}" alt="Product" class="w-12 h-12 object-cover rounded">
      </td>
      <td class="px-6 py-4">${product.product_name}</td>
      <td class="px-6 py-4">${product.category_id.name}</td>
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
      location.reload(); // or update UI without reloading
    }
  } catch (err) {
    console.error(err);
  }
}

//this function for search bar for user search
function productSearch(page = 1, limit = 9) {
  const searchKey = document.getElementById("searchInputPro").value.trim()

  fetch(`/products/search?key=${searchKey}&page=${page}&limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => {
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



function cancelCrop() {
  document.getElementById("imageCropModal").classList.add("hidden");
  cropImage = null;
  cropCanvas = null;
}

function confirmCrop() {
  cropCanvas.toBlob(blob => {
    const croppedFile = new File([blob], cropImage.name, { type: "image/jpeg" });
    addCroppedImageToPreview(croppedFile);
    document.getElementById("imageCropModal").classList.add("hidden");
  }, "image/jpeg", 0.9);
}

function addCroppedImageToPreview(file) {
  selectedFiles.push(file);
  const previewContainer = document.getElementById("imagePreview");
  const imageURL = URL.createObjectURL(file);

  const wrapper = document.createElement("div");
  wrapper.className = "relative";

  const img = document.createElement("img");
  img.src = imageURL;
  img.className = "w-24 h-24 object-cover rounded border";

  const removeBtn = document.createElement("button");
  removeBtn.innerHTML = "&times;";
  removeBtn.className = "absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs";
  removeBtn.onclick = () => {
    selectedFiles = selectedFiles.filter(f => f !== file);
    wrapper.remove();
  };

  wrapper.appendChild(img);
  wrapper.appendChild(removeBtn);
  previewContainer.appendChild(wrapper);
}

function deleteProduct(id) {

  const result = window.confirm("Are you sure you want to delete this product?");

  if (result) {
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