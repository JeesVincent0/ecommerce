function editCat(slug) {
    console.log(slug)

    //disable serc
    const searchBarContainer = document.getElementById("searchBarContainer");
    searchBarContainer.innerHTML = ""
    //diable category list section
    const maincategeryListSection = document.getElementById("maincategeryListSection");
    maincategeryListSection.classList.add("hidden");

    //enable edit category form
    const editCategoryForm = document.getElementById("maincategeryEditSection")
    editCategoryForm.classList.remove("hidden")

    fetch(`/category/edit?slug=${slug}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data)
            renderEditCategoryForm(data.category)
        })
        .catch((error) => console.log(error.message))
}

function renderEditCategoryForm(category) {
    const editFormSection = document.getElementById("maincategeryEditSection")
    editFormSection.innerHTML = ""
    editFormSection.innerHTML = `<div class="ml-[20%] mt-16 p-6">
        <div id="addCategoryFormSection">
            <h3 class="text-2xl font-bold mb-4">Edit Category</h3>
    
            <form id="addCategoryForm" class="space-y-4">
    <div id="categoryNameInputContainer">
        <label for="categoryName" class="block text-sm font-medium text-gray-700" id="categoryLabel1">Category name</label>
        <input type="text" id="categoryName1"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="${category.name}"
            name="name" required>
    </div>

    <div id="categoryDescriptionContainer">
        <label for="categoryDescription" class="block text-sm font-medium text-gray-700">Category description</label>
        <textarea id="categoryDescription1"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="${category.description}" 
            maxlength="500"
            name="description"></textarea>
        <p class="text-xs text-gray-500 mt-1"><span id="charCount">0</span>/500 characters</p>
    </div>

    <div id="categoryOffersContainer">
        <label for="categoryOffers" class="block text-sm font-medium text-gray-700">Offers (%)</label>
        <input type="number" id="categoryOffers1"
            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter any special offers for this category in numbers"
            name="offers">
    </div>

    <div>
        <label for="categoryStatus" class="block text-sm font-medium text-gray-700">Status</label>
        <select id="categoryStatus1" name="status" class="mt-2 w-full px-4 py-2 border rounded-md"
            required>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
        </select>
    </div>

    <button onclick="saveCategory('${category.slug}')" type="button" id="submitCategoryBtn" class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Update Category</button>
</form>
        </div>
    </div>`
}

function saveCategory(slug) {
    const categoryName = document.getElementById("categoryName1").value.trim();
    const categoryDiscription = document.getElementById("categoryDescription1").value.trim();
    const categoryStatus = document.getElementById("categoryStatus1").value
    const offers = document.getElementById("categoryOffers1").value.trim();

    console.log(categoryName, categoryDiscription, categoryStatus)

    fetch("/category/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName, description: categoryDiscription, status: categoryStatus, slug, offers })
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.status) {
                document.getElementById("categoryButton").click();
            } else {
                const categoryLabel = document.getElementById("categoryLabel1")
                categoryLabel.style.color = "red";
                categoryLabel.innerText = "Use another name"
            }
        })
        .catch((error) => console.log(error.message))
}