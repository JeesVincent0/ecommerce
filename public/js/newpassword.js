//validating two new password are equal or not
window.addEventListener("DOMContentLoaded", () => {
    const passwordField = document.getElementById("newpassword");
    const repassword = document.getElementById("repassword");
  
    repassword.addEventListener("input", () => {
      if (passwordField.value === repassword.value) {
        passwordField.style.borderColor = "green";
        repassword.style.borderColor = "green";
      } else {
        passwordField.style.borderColor = "red";
        repassword.style.borderColor = "red";
      }
    });
})

document.getElementById('saveButton').addEventListener('click', (e) => {
    e.preventDefault();
    const newpasswordField = document.getElementById("newpassword")
    const repasswordField = document.getElementById("repassword")

    const newpassword = newpasswordField.value.trim()
    const repassword = repasswordField.value.trim()

    if(newpassword !== repassword) return

   
    fetch('/createpassword', {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json' },
        body: JSON.stringify({ password: newpassword })
    })
    .then((res) => res.json())
    .then((data) => {
        if(data.success) window.location.href = data.redirectUrl
    })

})