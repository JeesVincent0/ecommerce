//@desc these functions for disable sections
//hide user list section
function hideUserSection() {
    const mainUserSession = document.getElementById("mainUserSession");
    mainUserSession.classList.add("hidden")
}
//hide product list section
function hideProductList() {
    const productListingSection = document.getElementById("productListingSection");
    productListingSection.classList.add("hidden")
}

//hide category list section
function hideCategoryList() {
    const maincategeryListSection = document.getElementById("maincategeryListSection");
    maincategeryListSection.classList.add("hidden");
}

//hide edit category section
function hideEditCategorySection() {
    const editCategoryForm = document.getElementById("maincategeryEditSection")
    editCategoryForm.classList.add("hidden")
}

//hide add category section
function hideAddCategorySection() {
    const addCategorySection = document.getElementById("maincategeryAddSection")
    addCategorySection.classList.add("hidden")
}


//@desc disable side button color
//hide category button color
function hideCategoryButton() {
    const categoryButton = document.getElementById("categoryButton");
    categoryButton.classList.remove("bg-gray-400");
}

//hide product button color
function hideProductButton() {
    const productsButton = document.getElementById("productsButton")
    productsButton.classList.remove("bg-gray-400")
}

function hideUserButton() {
    const usersButton = document.getElementById("usersButton");
    usersButton.classList.remove("bg-gray-400");

}

//@desc add side button color
//add user button color
function addUserButton() {
    const usersButton = document.getElementById("usersButton");
    usersButton.classList.add("bg-gray-400");
}