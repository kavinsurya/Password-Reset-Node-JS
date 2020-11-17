async function register() {
    let data = {
        name: document.getElementById('name').value,
        password: document.getElementById('password').value,
        mail: document.getElementById('mail').value,
        number: document.getElementById('number').value
    }

    fetch('http://localhost:3000/register', {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'content-Type': "application/json"
            }
        }).then(res => {
            if (res.status == 200) {
                alert("Registered successfully");
               
            } else {
                alert("Registration Failed");
               
            }
        })
        .catch(err => console.log( err))
}


async function login() {
    let data = {
        email: document.getElementById('loginName').value,
        password: document.getElementById('loginPassword').value
    }
    fetch('http://localhost:3000/login', {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'content-Type': "application/json"
        }
    }).then(res => {
        if (res.status == 200) {
            alert("Logged in Successfully");

        } else if (res.status == 400 || res.status == 401) {
            alert("Invalid Credentials");

        }
    })
        .catch(err => console.log(err))

}

