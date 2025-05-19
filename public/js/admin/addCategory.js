// Character counter for description
document.getElementById('categoryDescription').addEventListener('input', function () {
    const charCount = this.value.length;
    document.getElementById('charCount').textContent = charCount;
});

// Word limit function for description
function limitWords(element, maxWords) {
    let words = element.value.trim().split(/\s+/);
    if (words.length > maxWords) {
        element.value = words.slice(0, maxWords).join(" ");
    }
}

// Function to handle adding a new category section
function addCategory() {

    // Accessing DOM elements
    const addButton = document.getElementById("addButton");
    const maincategeryAddSection = document.getElementById("maincategeryAddSection");
    const maincategeryListSection = document.getElementById("maincategeryListSection");

    // Disable search bar
    const searchBarContainer = document.getElementById("searchBarContainer");
    if (searchBarContainer) {
        searchBarContainer.innerHTML = "";
    }

    // Enable and disable elements
    if (addButton) addButton.classList.add("hidden");
    if (maincategeryAddSection) maincategeryAddSection.classList.remove("hidden");
    if (maincategeryListSection) maincategeryListSection.classList.add("hidden");

}

// Function to submit the new category
function submitNewCategory() {
    const categoryName = document.getElementById("categoryName").value.trim();
    const categoryDescription = document.getElementById("categoryDescription").value.trim();
    const categoryStatus = document.getElementById("categoryStatus").value;
    const categoryOffers = document.getElementById("categoryOffers").value.trim();

    // Validation
    if (!categoryName) {
        const categoryLabel = document.getElementById("categoryLabel")
        categoryLabel.style.color = "red";
        categoryLabel.innerText = "Enter category name"
        return;
    }

    fetch("/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: categoryName,
            description: categoryDescription,
            status: categoryStatus,
            offer: categoryOffers,
        })
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.status) {
                if (document.getElementById("categoryButton")) {
                    document.getElementById("addCategoryForm").reset();
                    document.getElementById("categoryButton").click();
                } else {
                    document.getElementById('addCategoryForm').reset();
                    document.getElementById('charCount').textContent = '0';
                }
            } else {
                const categoryLabel = document.getElementById("categoryLabel")
                categoryLabel.style.color = "red";
                categoryLabel.innerText = "Use another name"
            }

        })
        .catch(error => {
            console.error('Error:', error);
        });
}
