async function register() {
    let data = {
        name: document.getElementById('name').value,
        password: document.getElementById('password').value,
        email: document.getElementById('mail').value,
        phone: document.getElementById('number').value
    }

    fetch('http://localhost:3000/register', {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'content-Type': "application/json"
            }
        }).then(res => {
            if (res.status == 200) {
                alert("Registration successful");
                document.getElementById('signupForm').reset();
                window.location.href ="/assets/login/login.html"
              
            } else {
                alert("Registration Failed");
              
            }
        })
        .catch(err => console.log("registration function : ", err))
}





