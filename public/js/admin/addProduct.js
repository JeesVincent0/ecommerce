// addProduct.js
let selectedFiles = [];
let cropImage = null;
let cropCanvas = null;
let cropCtx = null;
let originalImage = null;
let imageOffsetX = 0;
let imageOffsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let imgScale = 1;

function addProduct() {
  document.getElementById("categoriesContainer2").classList.remove("hidden");
  document.getElementById("productmainsection").classList.add("hidden");
  document.getElementById("paginationContainer2").innerHTML = "";
  document.getElementById("searchBarContainer").innerHTML = "";
  const productListingSection = document.getElementById("categoriesContainer2");
  productListingSection.innerHTML =`
    <form id="addProductForm" class="space-y-4" action="/product/add" method="POST" enctype="multipart/form-data">

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
        <input list="brandList" name="brand"
          class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Brand Name" required>

        <!-- Existing brands go here -->
        <datalist id="brandList">
          <!-- Add more brand options dynamically if needed -->
        </datalist>
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
        <input type="file" name="images" id="imageUploadAdd" multiple accept="image/*"
          class="mt-2 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>

          <small class="text-gray-500 block mt-1">Max 4 images. Max 2MB each. Must be square (1:1)</small>

          <div id="imagePreview" class="mt-4 flex flex-wrap gap-4"></div>
          <div id="uploadErrorAdd" class="text-red-500 mt-2 text-sm"></div>
      </div>

      <button type="button" onclick="saveProduct()"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        Save Product
      </button>

    </form >`;

  const categoryCanteiner = document.getElementById("categoryCanteiner")
  categoryCanteiner.innerHTML = "";

  fetch("/product/category")
    .then(res => res.json())
    .then(data => {
      if (data.categoyNames) {
        let categories = Array.isArray(data.categoyNames) ? data.categoyNames : [data.categoyNames];
        categories.forEach(category => {
          categoryCanteiner.innerHTML += `<option value="${category.slug}">${category.name}</option>`;
        });
      }
    });

    fetch("/product/brands", {
      method: "GET",
      headers: { "Content-Type" : "application/json" },
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        renderBrandOptions(data.brands)
      }
    })

  setupImageUploadValidation();
}

function renderBrandOptions(brands) {

  const brandList = document.getElementById("brandList");
  brandList.innerHTML = "";

  brands.forEach(brand => {
    brandList.innerHTML += `
    <option value="${brand.name}"></option>`
  });
}

window.onload = setupImageUploadValidation;

function setupImageUploadValidation(existingImages = []) {


  const imageInput = document.getElementById("imageUploadAdd");
  const previewContainer = document.getElementById("imagePreview");
  const uploadError = document.getElementById("uploadErrorAdd");

  // Show existing images
  existingImages.forEach(imgUrl => {
    const wrapper = createPreviewImageWrapper(imgUrl, null);
    previewContainer.appendChild(wrapper);
    selectedFiles.push({ file: null, url: imgUrl }); // Push existing image info
  });

  imageInput.addEventListener("change", function () {
    uploadError.innerText = "";
    const newFiles = Array.from(imageInput.files);

    newFiles.forEach(file => {
      if (selectedFiles.length >= 4) {
        uploadError.innerText = "You can only upload up to 4 images.";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        uploadError.innerText = `${file.name} is too large.`;
        return;
      }

      showCropModal(file);
    });

    imageInput.value = "";
  });

  // Cancel cropping
  document.getElementById("cancelCropBtn").onclick = () => {
    document.getElementById("imageCropModal").classList.add("hidden");
  };

  // Confirm cropping
  document.getElementById("confirmCropBtn").onclick = () => {
    const canvas = document.getElementById("cropCanvas");
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const wrapper = createPreviewImageWrapper(url, blob);
      previewContainer.appendChild(wrapper);
      selectedFiles.push({ file: blob, url });

      document.getElementById("imageCropModal").classList.add("hidden");
    }, "image/jpeg", 0.9);
  };
}

function createPreviewImageWrapper(imageSrc, fileBlob) {
  const wrapper = document.createElement("div");
  wrapper.className = "relative group";

  const img = document.createElement("img");
  img.src = imageSrc;
  img.className = "w-24 h-24 object-cover rounded";

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "×";
  removeBtn.className = "absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 hidden group-hover:flex items-center justify-center text-sm";
  removeBtn.onclick = () => {
    wrapper.remove();
    selectedFiles = selectedFiles.filter(f => f.url !== imageSrc);
  };

  wrapper.appendChild(img);
  wrapper.appendChild(removeBtn);
  return wrapper;
}

function showCropModal(file) {
  const modal = document.getElementById("imageCropModal");
  cropCanvas = document.getElementById("cropCanvas");
  cropCtx = cropCanvas.getContext("2d");

  const reader = new FileReader();

  reader.onload = function (e) {
    originalImage = new Image();
    originalImage.onload = () => {
      cropCanvas.width = 300;
      cropCanvas.height = 300;

      imgScale = Math.max(300 / originalImage.width, 300 / originalImage.height);
      imageOffsetX = (300 - originalImage.width * imgScale) / 2;
      imageOffsetY = (300 - originalImage.height * imgScale) / 2;

      const draw = () => {
        cropCtx.clearRect(0, 0, 300, 300);
        cropCtx.drawImage(
          originalImage,
          imageOffsetX,
          imageOffsetY,
          originalImage.width * imgScale,
          originalImage.height * imgScale
        );
      };

      draw();

      cropCanvas.onmousedown = (e) => {
        isDragging = true;
        dragStartX = e.offsetX - imageOffsetX;
        dragStartY = e.offsetY - imageOffsetY;
      };

      cropCanvas.onmousemove = (e) => {
        if (!isDragging) return;
        imageOffsetX = e.offsetX - dragStartX;
        imageOffsetY = e.offsetY - dragStartY;
        draw();
      };

      cropCanvas.onmouseup = () => { isDragging = false; };
      cropCanvas.onmouseleave = () => { isDragging = false; };

      // Remove old zoom listener
      cropCanvas.removeEventListener("wheel", handleWheelZoom);
      cropCanvas.addEventListener("wheel", handleWheelZoom, { passive: false });

      function handleWheelZoom(e) {
        e.preventDefault();
        const zoomAmount = 0.1;
        const direction = e.deltaY < 0 ? 1 : -1;
        const oldScale = imgScale;
        imgScale += direction * zoomAmount;
        imgScale = Math.max(0.1, Math.min(5, imgScale));

        const rect = cropCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const offsetXRatio = (mouseX - imageOffsetX) / (originalImage.width * oldScale);
        const offsetYRatio = (mouseY - imageOffsetY) / (originalImage.height * oldScale);

        imageOffsetX = mouseX - offsetXRatio * (originalImage.width * imgScale);
        imageOffsetY = mouseY - offsetYRatio * (originalImage.height * imgScale);

        draw();
      }

      cropImage = file;
      modal.classList.remove("hidden");
    };

    originalImage.src = e.target.result;
  };

  reader.readAsDataURL(file);
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
      selectedFiles = [];  // Clear after successful submit
      productList()
    })
    .catch(err => {
      console.error(err);
    });
}