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

  document.getElementById("signUp").addEventListener("click", () => {
    
    //DOM field assign to a variable
    const emailField = document.getElementById("email");
    const nameField = document.getElementById("name");
    const newpasswordField = document.getElementById("newpassword");
    const repasswordField = document.getElementById("repassword");
    const referralUrlField =  document.getElementById("referralUrl");
    const emailLabelField = document.getElementById("emailLabel");

    //DOM field values assign to a variable
    let email = emailField.value.trim();
    let name = nameField.value.trim();
    let newpassword = newpasswordField.value.trim();
    let repassword = repasswordField.value.trim();
    let referralUrl = referralUrlField.value.trim();

    //reset the border color to null
    nameField.style.borderColor = "";
    emailField.style.borderColor = "";
    newpasswordField.style.borderColor = "";
    repasswordField.style.borderColor = "";
    emailLabelField.innerText = "Email";
    emailLabelField.style.color = "";

    //input fields validation
    if (!name || !email || !repassword || !newpassword) {
      if (!name) nameField.style.borderColor = "red";
      if (!email) emailField.style.borderColor = "red";
      if (!newpassword) newpasswordField.style.borderColor = "red";
      if (!repassword) repasswordField.style.borderColor = "red";

      //validating entered value is email or not
      if (email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          emailField.style.borderColor = "red";
          emailLabelField.innerText = "Use Email";
          emailLabelField.style.color = "red";
        }
      }

      return;
    }


    //checking the entered two new passwords are equal or not
    if (newpassword !== repassword) {
      newpasswordField.style.borderColor = "red";
      repasswordField.style.borderColor = "red";
      return;
    }
    document.getElementById('loaderOverlay').classList.remove('hidden')
    document.getElementById('mainsection').classList.add('hidden')
    //this request is for validate form values
    fetch('/signup', {
      method: 'POST',
      headers: { 'content-type' : 'application/json'},
      body: JSON.stringify({ name: name, email: email, password: newpassword, referralUrl: referralUrl })
    })
    .then(res =>  res.json())
    .then(data => {


      //checking entered email is taken or not
      if(!data.success) {
        document.getElementById('loaderOverlay').classList.add('hidden')
        document.getElementById('mainsection').classList.remove('hidden')
        emailField.style.borderColor = "red";
        emailLabelField.innerText = "Use another Email";
        emailLabelField.style.color = "red";
      } else if(data.success && data.redirectUrl) {

        document.getElementById('loaderOverlay').classList.add('hidden')
        document.getElementById('mainsection').classList.remove('hidden')
        //redirecting page to otp varification page
        window.location.href = data.redirectUrl
      }

    })


  });
});


// this dom manipulation for redirect the router for google signup
document.getElementById('google').addEventListener('click', () => {
  window.location.href = '/auth/google'
})