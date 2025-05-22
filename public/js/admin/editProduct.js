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
  const productListingSection1 = document.getElementById("categoriesContainer2");
  productListingSection1.innerHTML = ""
  const productmainsection = document.getElementById("productmainsection")
  productmainsection.classList.add("hidden")
  const pagination = document.getElementById("paginationContainer2");
  pagination.innerHTML = "";
  const searchBarContainer = document.getElementById("searchBarContainer");
  searchBarContainer.innerHTML = "";
  const container = document.getElementById("categoriesContainer3");

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
    <label class="block text-sm font-medium text-gray-700">Discount Percentage (%)</label>
    <input type="number" name="discount_percentage" value="${product.discount_percentage}"
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
        <label class="block text-sm font-medium text-gray-700">Upload Product Images (4 Images)</label>
        <input type="file" name="images" id="imageUploadAdd" multiple accept="image/*"
          class="mt-2 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>

          <small class="text-gray-500 block mt-1">Max 4 images. Max 2MB each. Must be square (1:1)</small>

          <div id="imagePreview" class="mt-4 flex flex-wrap gap-4"></div>
          <div id="uploadErrorAdd" class="text-red-500 mt-2 text-sm"></div>
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



  setupImageUploadValidation(product.images)
}

function saveProduct1() {
  const form = document.getElementById("editProductForm");
  const formData = new FormData(form);

  const existingImages = [];


  selectedFiles.forEach(fileObj => {
    if (fileObj.file) {
      formData.append("images", fileObj);
    } else {
      existingImages.push(fileObj.url);
    }
  });



  selectedFiles.forEach(file => {
    formData.append("images", file);
  });

  // Append existing image paths as JSON string
  formData.append("existingImages", JSON.stringify(existingImages));

  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }


  fetch("/product/edit", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
      selectedFiles = [];  // Clear after successful submit
      productList()
      }
    })
    .catch(err => {
      console.error(err);
    });
}


// let selectedFiles1 = []; // Stores URLs (existing) and { file, previewUrl } (new)

// function setupImageUploadValidation1(existingImages = []) {
//     const imageInput = document.getElementById("imageUploadEdit1");
//     const previewContainer = document.getElementById("imagePreview1");
//     const uploadError = document.getElementById("uploadError1");
//     const cropperModal = document.getElementById("cropperModal");
//     const cropperImage = document.getElementById("cropperImage");
//     const cancelCrop = document.getElementById("cancelCrop");
//     const confirmCrop = document.getElementById("confirmCrop");
//     let cropper;

//     selectedFiles1 = [];
//     previewContainer.innerHTML = "";

//     // Show existing images
//     if (Array.isArray(existingImages)) {
//         existingImages.forEach(url => {
//             selectedFiles1.push(url);
//             renderImagePreview(url, true);
//         });
//     }

//     imageInput.addEventListener("change", () => {
//         uploadError.innerText = "";
//         const files = Array.from(imageInput.files);
//         let currentIndex = 0;

//         const processNext = () => {
//             if (currentIndex >= files.length) return;
//             const file = files[currentIndex++];

//             if (selectedFiles1.length >= 4) {
//                 uploadError.innerText = "Max 4 images allowed.";
//                 return;
//             }

//             if (file.size > 2 * 1024 * 1024) {
//                 uploadError.innerText = `${file.name} is too large (max 2MB).`;
//                 processNext();
//                 return;
//             }

//             const reader = new FileReader();
//             reader.onload = () => {
//                 cropperImage.src = reader.result;
//                 cropperModal.classList.remove("hidden");

//                 cropperImage.onload = () => {
//                     cropper = new Cropper(cropperImage, {
//                         aspectRatio: 1,
//                         viewMode: 1,
//                     });
//                 };

//                 cancelCrop.onclick = () => {
//                     cropper.destroy();
//                     cropperModal.classList.add("hidden");
//                     processNext();
//                 };

//                 confirmCrop.onclick = () => {
//                     const canvas = cropper.getCroppedCanvas({ width: 500, height: 500 });
//                     canvas.toBlob(blob => {
//                         if (blob.size > 2 * 1024 * 1024) {
//                             uploadError.innerText = "Cropped image too large.";
//                             cropper.destroy();
//                             cropperModal.classList.add("hidden");
//                             processNext();
//                             return;
//                         }

//                         const croppedFile = new File([blob], file.name, { type: blob.type });
//                         const previewUrl = URL.createObjectURL(croppedFile);
//                         selectedFiles1.push({ file: croppedFile, previewUrl });
//                         renderImagePreview(previewUrl, false);
//                         cropper.destroy();
//                         cropperModal.classList.add("hidden");
//                         processNext();
//                     }, 'image/jpeg');
//                 };
//             };
//             reader.readAsDataURL(file);
//         };

//         processNext();
//     });

//     function renderImagePreview(src, isExisting = false) {
//         const wrapper = document.createElement("div");
//         wrapper.className = "relative";

//         const img = document.createElement("img");
//         img.src = src;
//         img.className = "w-24 h-24 object-cover border rounded";

//         const removeBtn = document.createElement("button");
//         removeBtn.innerHTML = "&times;";
//         removeBtn.className = "absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center";
//         removeBtn.onclick = () => {
//             selectedFiles1 = selectedFiles1.filter(f => {
//                 if (typeof f === "string") return f !== src;
//                 return f.previewUrl !== src;
//             });
//             wrapper.remove();
//         };

//         wrapper.appendChild(img);
//         wrapper.appendChild(removeBtn);
//         previewContainer.appendChild(wrapper);
//     }
// }