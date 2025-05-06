let currentZoom = 1;
let mainImage; // Declare globally at the top

document.addEventListener("DOMContentLoaded", () => {
  mainImage = document.getElementById("mainImage");
  if (mainImage) {
    mainImage.style.transform = "scale(1)";
  }
});

function changeMainImage(src) {
  if (!mainImage) return;
  mainImage.src = src;
  currentZoom = 1;
  mainImage.style.transform = "scale(1)";
}

function zoomIn() {
  if (!mainImage) return;
  currentZoom += 0.2;
  mainImage.style.transform = `scale(${currentZoom})`;
}

function zoomOut() {
  if (!mainImage) return;
  if (currentZoom > 0.4) {
    currentZoom -= 0.2;
    mainImage.style.transform = `scale(${currentZoom})`;
  }
}

function goToProduct(productId) {
    window.location.href = `/product/view/${productId}`;
}

function buyNow(productId) {
    window.location.href = `/order/place/${productId}`;
}