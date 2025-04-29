function addCategory() {
    console.log("button pressed");

    // accessing DOM elements
    const addButton = document.getElementById("addButton");
    const maincategeryAddSection = document.getElementById("maincategeryAddSection");
    const maincategeryListSection = document.getElementById("maincategeryListSection");

    // disable search bar
    const searchBarContainer = document.getElementById("searchBarContainer");
    searchBarContainer.innerHTML = "";

    // enable and disable elements
    addButton.classList.add("hidden");
    maincategeryAddSection.classList.remove("hidden");
    maincategeryListSection.classList.add("hidden");

    // properly get parent ID from hidden span
    const selectedParentElement = document.getElementById("selectedParentId");
    const parentId = selectedParentElement.getAttribute("data-id") || null; // or null, or "" if you want no parent
    console.log("Using parent ID:", parentId);

    // Pass the correct parent ID
    loadCategoryData(parentId);
}


//this function is for transfer add category form data to server
function submitNewCategory() {
    const categoryName = document.getElementById("mainCategoryName").value.trim();
    const categoryDiscription = document.getElementById("categoryDescription").value.trim();
    const categoryStatus = document.getElementById("categoryStatus").value
    const parentId = document.getElementById("selectedParentId").getAttribute('data-id') || null;

    fetch("/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: parentId, categoryName: categoryName, categoryStatus: categoryStatus, categoryDescription: categoryDiscription })
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.status) {
                document.getElementById("categoryButton").click();
            }
        })
}

function limitWords(element, maxWords) {
    let words = element.value.trim().split(/\s+/);
    if (words.length > maxWords) {
        element.value = words.slice(0, maxWords).join(" ");
    }
}


function loadCategoryData(parent) {
    fetch(`/category/miancategory/${parent}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("data reached",data.categoryNames)
            let categories = Array.isArray(data.categoryNames) ? data.categoryNames : [data.categoryNames];
            if (data.parent && data.categoryNames) {
                loadForm(categories, "optionsContainer1")
            } else if (!data.parent && data.categoryNames && data.child) {
                loadForm(categories, "optionsContainer1")
            }



        })
}

// this function will show the suggestion options
function loadForm(categoryNames, id) {
    console.log("loadForm", categoryNames)
    const optionsContainer = document.getElementById(id);
    optionsContainer.innerHTML = "";
    categoryNames.forEach(category => {
        optionsContainer.innerHTML += `<option value="${category.slug}" data-id="${category._id}">${category.slug}</option>`
    });
}

// if admin select any option given that appearse on the field
function catName(selectedElement, id) {
    console.log(id)
    console.log(selectedElement.value)
    const inputField = document.getElementById(id);
    const categoriesLabelField = document.getElementById("categoriesLabel")
    const selectedParentId = document.getElementById("selectedParentId")

    const selectedOption = selectedElement.options[selectedElement.selectedIndex];
    const categoryId = selectedOption.getAttribute('data-id');
    selectedParentId.setAttribute('data-id', categoryId);
    categoriesLabelField.innerText = "Add subcategory for " + selectedElement.value
    loadCategoryData(categoryId)
}