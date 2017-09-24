function getResources() {
    axios.get('/resource/all')
    .then(res => {
        var items = res.data;
        authToken = localStorage.getItem("authToken");
        items.forEach((element) => {
            console.log(element);
            var ID = element._id;

            // Create element container.
            var cont = document.createElement("div");
            cont.classList.add("item-cont");

            // Create element info DIV.
            var node = document.createElement("div");
            node.innerHTML = "Name: " + element.name + " <br> Price: £" + element.price + " <br> Desc: " + element.description + " <br>Quantity: " + element.quantity + " <br> Rota: " + element.rota;
            
            // Create button.
            var topup = document.createElement("button");
            topup.setAttribute("onClick", "topup('" + ID + "', '" + authToken + "');");
            topup.innerHTML = "Topup"

            

            cont.appendChild(node);
            cont.appendChild(topup);
            // cont.appendChild(form);
            var element = document.getElementById("list");
            element.appendChild(cont);
        });
    });
}

function topup(id, authToken) {
    alert('Topped Up!');
    axios.post('/resource/topup', {
        id: id,
        authToken: authToken,
        quantity: 1
    })
    .then(res => {
        console.log(res.data)
        if (res.data.msg) alert(res.data.msg)
        window.location.reload();
    })
}

function login() {
    var uname = document.getElementById('log_uname').value;
    var pword = document.getElementById('log_pword').value;
    axios.post('/login', {
        username: uname,
        password: pword
    }).then(res => {
        if (res.data.authToken) {
            localStorage.setItem("authToken", res.data.authToken);
        }
    })

}

function register() {
    var uname = document.getElementById('reg_uname').value;
    var pword = document.getElementById('reg_pword').value;
    axios.post('/register', {
        username: uname,
        password: pword
    }).then(res => {
        console.log(res.data)
        if (res.data.authToken) {
            localStorage.setItem("authToken", res.data.authToken);
        }
    })
}

getResources();

var authToken = localStorage.getItem("authToken");
console.log(authToken)