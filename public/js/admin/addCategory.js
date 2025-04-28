function addCategory() {
    console.log("button pressed")
    //accessing DOM elements
    const addButton = document.getElementById("addButton");
    const maincategeryAddSection = document.getElementById("maincategeryAddSection");
    const maincategeryListSection = document.getElementById("maincategeryListSection");

    //enable and disable elements
    addButton.classList.add("hidden");
    maincategeryAddSection.classList.remove("hidden");
    maincategeryListSection.classList.add("hidden");

    loadCategoryData()
}

//this function is for transfer add category form data to server
function submitNewCategory() {
    const categoryName = document.getElementById("mainCategoryName").value.trim();
    const categoryDiscription = document.getElementById("categoryDescription").value.trim();
    const categoryStatus = document.getElementById("categoryStatus").value
    const selectedParentId = document.getElementById("selectedParentId").getAttribute("data-id")

    fetch("/category", {
        method: "POST", 
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify({ parentId: selectedParentId, categoryName: categoryName, categoryStatus: categoryStatus, categoryDescription: categoryDiscription})
    })
    .then((res) => res.json())
    .then((data) => {

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
        headers: { "Content-Type" : "application/json" }
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(data.categoryNames)
        let categories = Array.isArray(data.categoryNames) ? data.categoryNames : [data.categoryNames];
        if(data.parent && data.categoryNames) {
            loadForm(categories, "optionsContainer1")
        } else if(!data.parent && data.categoryNames && data.child) {
            loadForm(categories, "optionsContainer1")
        }
         


    })
}

//this function will show the suggestion options
function loadForm(categoryNames, id) {
    const optionsContainer = document.getElementById(id);
    optionsContainer.innerHTML = "";
    categoryNames.forEach(category => {
        optionsContainer.innerHTML += `<option value="${category.slug}" data-id="${category._id}">${category.slug}</option>`
    });
}

// function loadForm2(categoryNames) {
//     console.log(categoryNames);
//     const childCategoryContainer = document.getElementById("childCategoryContainer");
    
//     // Check if the form already exists
//     // let formExists = childCategoryContainer.querySelector("#typeCategory");
    
//     // if (!formExists) {
//         childCategoryContainer.innerHTML += `<div class="relative">
//                         <label for="categoryType" class="block text-sm font-medium text-gray-700">Child Category</label>
//                         <input type="text" id="typeCategory"
//                             class="mt-2 border-2 border-gray-300 rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             placeholder="Enter Category Name or Select">
//                         <div class="absolute top-0 right-0 ">
//                             <select id="select-field" onchange="updateChildInput(this)"
//                                 class="mt-7 border-2 border-gray-300 rounded-lg bg-white p-2 w-44 focus:outline-none focus:ring-2 focus:ring-blue-500">
//                                 <option value="">Existing Types</option>
//                                 <div id="optionsContainer2"></div>
//                             </select>
//                         </div>
//                     </div>`;
//     // }

//     // Update options
//     const optionsContainer = document.getElementById("optionsContainer2");
//     optionsContainer.innerHTML = '';
//     categoryNames.forEach(category => {
//         optionsContainer.innerHTML += `<option value="${category.slug}" data-id="${category._id}">${category.slug}</option>`;
//     });
// }

// function loadForm3(parentId) {
//     const childCategoryContainer = document.getElementById("childCategoryContainer");
//     childCategoryContainer.innerHTML += `<div class="relative">
//                         <label for="categoryType" class="block text-sm font-medium text-gray-700">New Category</label>
//                         <span class="hidden" id="spanId">${parentId}</span>
//                         <input type="text" id="typeCategory"
//                             class="mt-2 border-2 border-gray-300 rounded-lg py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             placeholder="Enter Category Name or Select">
//                     </div>`;
// }

// // New separate function for updating the input
// function updateChildInput(selectElement) {
//     const inputField = document.getElementById("typeCategory");
//     if (inputField) {
//         inputField.value = selectElement.value;
        
//         const selectedOption = selectElement.options[selectElement.selectedIndex];
//         const categoryId = selectedOption.getAttribute('data-id');
//         console.log(categoryId);
//         if (categoryId) {
//             loadCategoryData(categoryId);
//         }
//     } else {
//         console.error("Could not find child category input field");
//     }
// }

//if admin select any option given that appearse on the field
function catName(selectedElement,id) {
    console.log(id)
    console.log(selectedElement.value)
    const inputField = document.getElementById(id);
    const categoriesLabelField = document.getElementById("categoriesLabel")
    const selectedParentId = document.getElementById("selectedParentId")

    const selectedOption = selectedElement.options[selectedElement.selectedIndex];
    const categoryId = selectedOption.getAttribute('data-id');
    selectedParentId.setAttribute('data-id', categoryId);
    categoriesLabelField.innerText = "Add subcategory for "+selectedElement.value

    // const selectedOption = selectedElement.options[selectedElement.selectedIndex];
    // const categoryId = selectedOption.getAttribute('data-id')
    console.log(categoryId)
    loadCategoryData(categoryId)
}