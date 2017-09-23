function getResources() {
    axios.get('/resource/all')
    .then(res => {
        items = res.data;
        items.forEach((element) => {
            console.log(element);
            // Create element container.
            var cont = document.createElement("div");
            cont.classList.add("item-cont");

            // Create element info DIV.
            var node = document.createElement("div");
            node.innerHTML = element.name + " <br> £" + element.price + " <br> Desc: " + element.description + " <br>Quantity: " + element.quantity + " <br> Rota: " + element.rota;
            
            // Create form.
            var form = document.createElement("form");
            var topup = document.createElement("button");
            form.appendChild(topup);
            

            cont.appendChild(node);
            cont.appendChild(form);
            var element = document.getElementById("list");
            element.appendChild(cont);
        });
    });
}

getResources();