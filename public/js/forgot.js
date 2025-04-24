document.getElementById('sendButton').addEventListener('click', (e) => {
    e.preventDefault();

    //geting DOM elements
    const emailField = document.getElementById('email')
    const emailLabelField = document.getElementById('emailLabel')

    const email = emailField.value.trim()

    //resetin DOM
    emailField.style.borderColor = ''
    emailLabelField.innerText = 'Email'
    emailLabelField.style.color = ''

    document.getElementById('loaderOverlay').classList.remove('hidden')
    document.getElementById('mainsection').classList.add('hidden')
    //email validation and otp sending
    fetch('/forgottonpassword/checkemail', {
        method: 'POST',
        headers: { 'content-type' : 'application/json'},
        body: JSON.stringify({ email: email})
    })
    .then((res) => res.json())
    .then((data) => {

        console.log('data come', data)
        document.getElementById('loaderOverlay').classList.add('hidden')
        document.getElementById('mainsection').classList.remove('hidden')
        //email validation
        if(!data.email && !data.success) {
            emailField.style.borderColor = 'red'
            emailLabelField.innerText = 'Wrong email'
            emailLabelField.style.color = 'red'
        }
    })
    .catch((error) => {
        console.log(error)
    })
})

document.getElementById('verify').addEventListener('click', (e) => {
    e.preventDefault()
    
    const otpField = document.getElementById('otp')
    const otpLabelField = document.getElementById('otpLabel')
    const emailField = document.getElementById('email')

    const otp = otpField.value.trim()
    const email = emailField.value.trim()

    //resetting the color of borders
    emailField.style.borderColor = ''
    otpField.style.borderColor = ''

    if(!email || !otp){
        if(!email) emailField.style.borderColor = 'red'
        if(!otp) otpField.style.borderColor = 'red'
        return
    }

    fetch('/forgottonpassword/checkotp',{
        method: 'POST',
        headers: { 'Content-Type' : 'application/json' },
        body: JSON.stringify({ email: email, otp: otp})
    })
    .then((res) => res.json())
    .then((data) => {
        console.log('otp data - ', data)
        if(!data.success) {
            otpField.style.borderColor = 'red'
            otpLabelField.innerText = 'Wrong OTP'
            otpLabelField.style.color = 'red'
        } else if(data.success) {
            console.log('otp success')
            window.location.href = data.redirectUrl
        }
        
    })
    .catch((error) => console.log(error.message))
})