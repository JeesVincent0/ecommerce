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
                    <div class="relative">
                        <label for="categoryType" class="block text-sm font-medium text-gray-700"
                            id="categoriesLabel">Category Name</label>
                            <span id="selectedParentId" class="hidden"></span>
                        <input type="text" id="mainCategoryName1"
                            class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="${category.name}"
                            name="categoryName">
                        
                    </div>
    
                </div>
    
                <div id="categoryDiscription">
                    <label class="block text-sm font-medium text-gray-700" id="categoriesLabel">Add
                        Category discription</label>
                        <textarea id="categoryDescription1"
                        class="mt-2 border rounded-lg py-2 pl-3 pr-10 w-full h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="${category.description}" 
                        oninput="limitWords(this, 50)" 
                        name="description"></textarea>
                </div>
    
                <div>
                    <label for="categoryStatus" class="block text-sm font-medium text-gray-700">Status</label>
                    <select id="categoryStatus1" name="categoryStatus" class="mt-2 w-full px-4 py-2 border rounded-md"
                        required>
                        <option value="active">${category.status}</option>
                        <option value="inactive">${category.status === "active" ? "inactive" : "active"}</option>
                    </select>
                </div>
    
                <button type="button" onclick="saveCategory('${category.slug}')" class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Save
                    Category</button>
            </form>
        </div>
    </div>`
}

function saveCategory(slug) {
    const categoryName = document.getElementById("mainCategoryName1").value.trim();
    const categoryDiscription = document.getElementById("categoryDescription1").value.trim();
    const categoryStatus = document.getElementById("categoryStatus1").value

    console.log(categoryName, categoryDiscription, categoryStatus)

    fetch("/category/edit", {
        method: "PATCH",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify({ name: categoryName, description: categoryDiscription, status: categoryStatus , slug})
    })
    .then((res) => res.json())
    .then((data) => {
        if(data.status) {
            document.getElementById("categoryButton").click();
        }
    })
    .catch((error) => console.log(error.message))
}