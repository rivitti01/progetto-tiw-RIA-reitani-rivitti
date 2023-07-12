sessionStorage.clear();

{
    let ordini;
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

    document.getElementById('ordini').onclick = function(){
        ordini = new Ordini(document.getElementById('container'));
        ordini.show();
    };

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

    this.showOrdini = function(){
        this.hide();
        if( localStorage.getItem("utente") == null )
            logout();
        else
            ordini.show();
    }

    /************************************************************************************/

    function Ordini(container){
        this.container = container;

        // metodo che recupera gli ordini
        this.show = function(){
            container.innerHTML = "";
            // salvo this in self per colpa della visibilità di js
            const self = this;

            // se presente la divSearch la tolgo
            let divSearch = document.querySelector('.searchForm');
            if( divSearch )
                divSearch.remove();

            // faccio la chiamata di get per vedere gli ordini
            makeCall("GET", "Ordini", null, function(risposta){
                if( risposta.readyState === XMLHttpRequest.DONE ){
                    switch( risposta.status ){
                        case 200: // ok
                            self.riempiPaginaOrdini(risposta);
                            break;
                        case 401: // unauthorized
                            alert("Non sei loggato.\nVerrai riportato al login.");
                            logout();
                            break;
                        case 500: // server error
                            alert("Errore nel server.\nVerrai riportato alla home.");
                            //pageOrchestrator.hide();
                            //pageOrchestrator.showHome();
                            break;
                        default:
                            alert("Errore sconosciuto.");
                            //pageOrchestrator.hide();
                            //pageOrchestrator.showHome();
                            break;
                    }
                }
            } );
        }

        // metodo che riempie effettivamente la pagina degli ordini
        this.riempiPaginaOrdini = function(risposta){
            // prendo gli ordini
            let ordini;
            try {
                ordini = JSON.parse(risposta.responseText);
            } catch (e) {
                alert("Errore lato client durante il parsing di JSON degli ordini forniti dal server: " + e);
                return;
            }

            // se non ci sono ordini non mostro nulla
            if( ordini.length === 0 ){
                let p = document.createElement('p');
                p.textContent = "Non hai ancora effettuato ordini!";
                this.container.appendChild(p);
                return;
            }

            // aggiungo il titolo
            let h2 = document.createElement('h2');
            h2.textContent = "Ecco i tuoi ordini:";
            this.container.appendChild(h2);

            // aggiungo il div che conterrà gli ordini
            let divRisultati = document.createElement('div');
            divRisultati.classList.add("risultati");
            h2.appendChild(divRisultati);

            // aggiungo la lista di ordini
            let listview = document.createElement('ul');
            listview.classList.add("listview");
            divRisultati.appendChild(listview);

            //aggiungo la tabella con gli ordini
            let table = document.createElement('table');
            listview.appendChild(table);
            let tableHead = document.createElement('thead');
            table.appendChild(tableHead);
            let tableHeaderRow = document.createElement('tr');
            tableHead.appendChild(tableHeaderRow);
            //do il nome alle colonne
            let nomiColonneP = ['Codice ordine','Nome fornitore','Data spedizione','Prezzo totale','indirizzo di spedizione'];
            for( let i=0; i<nomiColonneP.length; i++ ){
                let th = document.createElement('th');
                th.textContent = nomiColonneP[i];
                tableHeaderRow.appendChild(th);
            }
            // aggiungo il corpo della tabella
            let tableBody = document.createElement('tbody');
            table.appendChild(tableBody);

            // per ogni ordine, aggiungo un elemento alla lista
            ordini.forEach( (o) => {

                // aggiungo una riga per l'ordine alla tabella
                let rigaOrdine = document.createElement('tr');
                tableBody.appendChild(rigaOrdine);
                // aggiungo il codice ordine alla riga
                let tdCodiceOrdine = document.createElement('td');
                tdCodiceOrdine.textContent =o.ordine.codiceOrdine;
                rigaOrdine.appendChild(tdCodiceOrdine);
                // aggiungo la quantità alla riga
                let tdNomeFornitore = document.createElement('td');
                tdNomeFornitore.textContent = o.ordine.nomeFornitore
                rigaOrdine.appendChild(tdNomeFornitore);
                // aggiungo la data di spedizione alla riga
                let tdDataSpedizione = document.createElement('td');
                tdDataSpedizione.textContent = o.ordine.dataSpedizione;
                rigaOrdine.appendChild(tdDataSpedizione);
                // aggiungo il prezzo totale alla riga
                let tdPrezzoTotale = document.createElement('td');
                tdPrezzoTotale.textContent = o.ordine.prezzoTotale;
                rigaOrdine.appendChild(tdPrezzoTotale);
                // aggiungo l'indirizzo di spedizione alla riga
                let tdIndirizzoSpedizione = document.createElement('td');
                tdIndirizzoSpedizione.textContent = o.ordine.indirizzoSpedizione;
                rigaOrdine.appendChild(tdIndirizzoSpedizione);

                // creo una riga per il nome delle informazioni
                let rigaInformazioni = document.createElement('tr');
                tableBody.appendChild(rigaInformazioni);
                // creo una colonna per ogni informazione necessaria
                let nomiColonneP = ['Prodotti:','Quantità:'];
                for( let i=0; i<nomiColonneP.length; i++ ){
                    let td = document.createElement('td');
                    td.textContent = nomiColonneP[i];
                    rigaInformazioni.appendChild(td);
                }

                // gestisco i prodotti in ogni ordine
                o.informazioni.forEach( (i) => {
                    // aggiungo una riga alla tabella
                    let rigaProdotto = document.createElement('tr');
                    tableBody.appendChild(rigaProdotto);
                    // aggiungo il nome alla riga
                    let tdNome = document.createElement('td');
                    tdNome.textContent = i.nome;
                    rigaProdotto.appendChild(tdNome);
                    // aggiungo la quantita alla riga
                    let tdQuantita = document.createElement('td');
                    tdQuantita.textContent = i.quantità;
                    rigaProdotto.appendChild(tdQuantita);
                })

            })

        }
    }


}