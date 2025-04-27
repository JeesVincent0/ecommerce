document.getElementById("login").addEventListener("click", (e) => {
    e.preventDefault();

    //getting DOM elements to variables
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");
    const emailLabelField = document.getElementById("emailLabel");
    const passLabelField = document.getElementById("passLabel")

    //geting elemnts values to variables
    const email = emailField.value.trim();
    const password = passwordField.value.trim();

    //resetting elements
    emailField.style.borderColor = "";
    passwordField.style.borderColor = "";
    emailLabelField.innerText = "Email";
    passLabelField.innerText = "Password";
    emailLabelField.style.color = "";
    passLabelField.style.color = "";

    //frontend validation
    if (!email || !password) {

        //checking each input fields
        if (!email) emailField.style.borderColor = "red";
        if (!password) passwordField.style.borderColor = "red";

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

    //email and password validation from server (backend)
    fetch("/adminlogin", {
        method: "POST",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify({ email: email, password: password })
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(data)

        if(!data.email && !data.password) {
            //if email not matching DOM will change
            emailLabelField.innerText = "Wrong email";
            emailLabelField.style.color = "red";
            emailField.style.borderColor = "red";
            console.log("a")
        } else if(!data.password && data.email) {
            //if password not matching DOM will change
            passLabelField.innerText = "Wrong password";
            passLabelField.style.color = "red";
            passwordField.style.borderColor = "red";
            console.log("b")

        } else if(data.success && data.redirectUrl) {
            console.log("c")
            window.location.href = data.redirectUrl
        }
    })

})