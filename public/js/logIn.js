window.addEventListener("DOMContentLoaded", () => {
document.getElementById("login").addEventListener("click", () => {

  //geting all DOM elements to variables
  const emailField = document.getElementById("email")
  const passwordField = document.getElementById("password")
  const emailLabelField = document.getElementById("emailLabel");
  const passLabelField = document.getElementById("passLabel");

  //getting the DOM values
  const email = emailField.value.trim();
  const password = passwordField.value.trim();

  //Resetting DOM
  emailField.style.borderColor = '';
  passwordField.style.borderColor = "";
  emailLabelField.innerText = "Email";
  passLabelField.innerText = "Password";
  emailLabelField.style.color = "";
  passLabelField.style.color = "";

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type" : "application/json" },
    body: JSON.stringify({ email: email, password: password })
  })
  .then((res) => res.json())
  .then((data) => {
    if(!data.email && !data.block) {
      //If email wrong, it will change the email input field
      console.log("email not matching")
      emailLabelField.innerText = "Wrong email";
      emailLabelField.style.color = "red";
      emailField.style.borderColor = "red";
    } else if(!data.pass) {
      //if password wrong it will change the password input field
      console.log("password not matching")
      passLabelField.innerText = "Wrong password";
      passLabelField.style.color = "red";
      passwordField.style.borderColor = "red";
    } else if(data.block) {
      console.log("email not matching")
      emailLabelField.innerText = "User blocked";
      emailLabelField.style.color = "red";
      emailField.style.borderColor = "red";
    }
    if (data.success) {

      localStorage.setItem("Token", data.token)
      window.location.href = data.redirectUrl;
    }
    
  })
  .catch((error) => console.log("Error - ", error.message))

})
});

// this dom manipulation for redirect the router for google signup
document.getElementById('google').addEventListener('click', () => {
  window.location.href = '/auth/google'
})