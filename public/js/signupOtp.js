document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('verify').addEventListener('click', () => {

    const passwordField = document.getElementById('password')
    const otpLabel = document.getElementById("otpLabel")
    const password = passwordField.value.trim()

    fetch('/signup/otp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ otp: password })
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          passwordField.style.borderColor = 'red'
          otpLabel.innerText = data.message
        } else if (data.success) {
          window.location.href = data.redirectUrl
        }
      })

  })
})