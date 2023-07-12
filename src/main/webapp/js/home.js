sessionStorage.clear();

{
    let home;
    //#####MAPPIAMO LE FUNZIONI AI BOTTONI#####

    // aggiungo la funzione al click del bottone di logout
    document.getElementById("logout").addEventListener("click", function(){
        logout();
    });
    document.getElementById("home").addEventListener("click", function(){
        this.container = document.getElementById("container");
        home = new Home(this.container);
        home.show();
    });

    //#####DICHIARIAMO LE FUNZIONI#####

    //home
    function Home(container) {
        this.container = container;
        this.show = function(){
            container.innerHTML = "";
            let self = this;
            //aggiungere la

            //barra di ricerca

            makeCall("GET","Home",null, function (risposta){
                if (risposta.readyState == XMLHttpRequest.DONE) {
                    switch (risposta.status) {
                        case 200:
                            self.visualizzaProdotti(risposta);
                            break;
                        case 401: // unauthorized
                            alert("Non sei autorizzato ad accedere a questa pagina");
                            logout();
                            break;
                        case 500: // server error
                            alert("Errore del server");
                            break;
                        default: // errore generico
                            alert("Errore");
                            break;
                    }
                }

            });

            this.visualizzaProdotti = function(risposta){
                let prodotti;
                try{
                    prodotti = JSON.parse(risposta.responseText);
                } catch(e) {
                    alert("Errore lato client durante il parsing di JSON dei prodotti forniti dal server: " + e);
                    return;
                }

                if (prodotti.length === 0) {
                    alert("Non ci sono prodotti disponibili");
                    return;
                }else {
                    let divTitolo = document.createElement("div");
                    container.className = "centered-row";
                    this.container.appendChild(divTitolo);

                    let titoloh1 = document.createElement("h1");
                    titoloh1.textContent = "Potrebbero interessarti!";
                    divTitolo.appendChild(titoloh1);

                    let divContainer = document.createElement('div');
                    divContainer.classList.add("card-container");
                    this.container.appendChild(divContainer);

                    for( let i=0; i<prodotti.length; i++ ){
                        let card = document.createElement('div');
                        card.classList.add("card");
                        divContainer.appendChild(card);

                        // ci metto dentro l'immagine
                        let img = document.createElement('img');
                        img.src = 'data:image/jpg;base64,' + prodotti[i].fotoBase64;
                        img.classList.add('card-img-top');
                        card.appendChild(img);

                        // e riempio il body
                        /*let cardBody = document.createElement('div');
                        cardBody.classList.add("card-body");
                        card.appendChild(cardBody);*/
                        // e nome
                        let nomeParag = document.createElement('p');
                        nomeParag.textContent = "Nome Prodotto: " + prodotti[i].nomeProdotto;
                        card.appendChild(nomeParag);

                        let categoria = document.createElement('p');
                        nomeParag.textContent = "Categoria: " + prodotti[i].categoria;
                        card.appendChild(categoria);

                        let descrizione = document.createElement('p');
                        nomeParag.textContent = "Descrizione: " + prodotti[i].descrizione;
                        card.appendChild(descrizione);

                    }
                }
            }
        }
    }

    //logout
    function logout() {
        makeCall("GET", 'Logout', null, function (risposta) {
            if (risposta.readyState === XMLHttpRequest.DONE) {
                sessionStorage.clear();
                window.location.href = "index.html";
            }
        });
    }


}