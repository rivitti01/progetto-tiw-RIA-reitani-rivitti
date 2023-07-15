

{
    /************************************************************************************/

    // dichiaro il pageOrchestrator e le variabili che conterranno i componenti della pagina
    let home, ricerca, carrello, ordini;
    let pageOrchestrator = new PageOrchestrator();

    /************************************************************************************/

    // se quando la pagina carica non sono loggato chiamo logout, altrimenti visualizzo la home
    window.addEventListener('load', function(){
        pageOrchestrator.start();
        if( sessionStorage.getItem("email") == null )
            logout()
        else
            pageOrchestrator.showHome();
    } );

    /************************************************************************************/

    //#####DICHIARIAMO LE FUNZIONI#####

    //logout
    function logout() {
        makeCall("GET", 'Logout', null, function (risposta) {
            if (risposta.readyState === XMLHttpRequest.DONE) {
                sessionStorage.clear();
                window.location.href = "index.html";
            }
        });
    }

    /************************************************************************************/

    function PageOrchestrator(){

        // prendo il container della pagina
        this.container = document.getElementById('container');

        // metodo che inizializza l'oggetto
        this.start = function(){
            // salvo this in self per colpa della visibilità di js
            const self = this;

            // creo un oggetto-pagina Home
            home = new Home(this.container);
            // creo un oggetto-funzionalità Search
            ricerca = new Ricerca(this.container);
            // creo un oggetto-pagina Carrello
            //carrello = new Carrello(this.container);
            // creo un oggetto-funzionalità Ordine
            ordini = new Ordini(this.container);

            // assegno al bottone carrello la funzione
            document.getElementById('carrello').onclick = function(){
                self.hide();
                self.showCarrello();
            };

            // assegno al bottone ordini la funzione
            document.getElementById('ordini').onclick = function(){
                self.hide();
                self.showOrdini();
            };

            // assegno al bottone Home la funzione
            document.getElementById('home').onclick = function(){
                self.hide();
                self.showHome();
            };

            // aggiungo la funzione al click del bottone di logout
            document.getElementById("logout").addEventListener("click", function(){
                logout();
            });

            // svuoto la pagina
            self.hide();
        }

        // svuoto la pagina
        this.hide = function(){
            this.container.innerHTML = "";
        }

        // mostro la home
        this.showHome = function(){
            this.hide();
            if( sessionStorage.getItem("email") == null )
                logout();
            else
                home.show();
        }

        // mostro il carrello
        this.showCarrello = function(){
            this.hide();
            if( sessionStorage.getItem("email") == null )
                logout();
            else
                carrello.show();
        }

        // mostro gli ordini
        this.showOrdini = function(){
            this.hide();
            if( sessionStorage.getItem("email") == null )
                logout();
            else
                ordini.show();
        }
    }

    /************************************************************************************/

    //home
    function Home(container) {
        this.container = container;

        // metodo che visualizza i prodotti
        this.show = function(){
            container.innerHTML = "";
            let self = this;
            //aggiungere la

            let ricerca = new Ricerca(this.container);

            //barra di ricerca
            let divSearch = document.querySelector('.searchForm');
            if( !divSearch ){
                divSearch = document.createElement('div');
                divSearch.classList.add("searchForm");
                document.getElementById("menuBar").insertBefore(divSearch,null);
                let formSearch = document.createElement('form');
                formSearch.action = "#";
                formSearch.id = "formRisultati";
                divSearch.appendChild(formSearch);
                let inputSearch = document.createElement('input');
                inputSearch.type = "text";
                inputSearch.placeholder = "Cerca...";
                inputSearch.name = "word";
                inputSearch.required = true;
                let posizione = document.createElement("input");
                posizione.type = "hidden";
                posizione.name = "posizione";
                posizione.value = "0";
                formSearch.appendChild(inputSearch);
                formSearch.appendChild(posizione);
                // in caso di invio, chiamo il metodo cerca
                formSearch.addEventListener("submit", ricerca.cerca);
            }


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

                    let titoloh1 = document.createElement("h1");
                    titoloh1.textContent = "Potrebbero interessarti!";
                    this.container.appendChild(titoloh1);

                    let divContainer = document.createElement('div');
                    divContainer.classList.add("card-container");
                    this.container.appendChild(divContainer);

                    //aggiungo la tabella con gli ordini
                    let table = document.createElement('table');
                    divContainer.appendChild(table);
                    let tableHead = document.createElement('thead');
                    table.appendChild(tableHead);
                    let tableHeaderRow = document.createElement('tr');
                    tableHead.appendChild(tableHeaderRow);
                    //do il nome alle colonne
                    let nomiColonneP = ['Foto','Nome','Categoria','Descrizione'];
                    for( let i=0; i<nomiColonneP.length; i++ ){
                        let th = document.createElement('th');
                        th.textContent = nomiColonneP[i];
                        tableHeaderRow.appendChild(th);
                    }
                    // aggiungo il corpo della tabella
                    let tableBody = document.createElement('tbody');
                    table.appendChild(tableBody);

                    prodotti.forEach( (p) => {

                        //creo la riga
                        let tr = document.createElement('tr');
                        tableBody.appendChild(tr);
                        //inserisco l'immagine
                        let img = document.createElement('img');
                        img.src = 'data:image/jpg;base64,' + p.fotoBase64;
                        img.classList.add('card-img-top');
                        tr.appendChild(img);
                        //inserisco il nome
                        let tdNome = document.createElement('td');
                        tdNome.textContent = p.nomeProdotto;
                        tr.appendChild(tdNome);
                        //inserisco la categoria
                        let tdCategoria = document.createElement('td');
                        tdCategoria.textContent = p.categoria;
                        tr.appendChild(tdCategoria);
                        //inserisco la descrizione
                        let tdDescrizione = document.createElement('td');
                        tdDescrizione.textContent = p.descrizione;
                        tr.appendChild(tdDescrizione);
                    })

                }
            }
        }
    }

    /************************************************************************************/

    function Ricerca(container){
        this.containter = container;
        let posizione;
        let word;

        // salvo this in self per colpa della visibilità di js
        const self = this;

        // questo metodo effettua la ricerca dei risultati
        this.cerca = function(e){
            // impedisco l'azione di default di submit (action)
            e.preventDefault();
            // svuoto la pagina
            self.containter.innerHTML = "";

            // prendo il form
            var form = e.target;

            let url = 'Ricerca?' +new URLSearchParams(new FormData(form)).toString();
            word=form.elements["word"].value;
            posizione=form.elements["posizione"].value;

            // se il contenuto della barra di ricerca al momento del submit è valido
            if( form.checkValidity() )

                // faccio la chiamata alla servlet dei risultati
                makeCall("GET", 'Ricerca?' +new URLSearchParams(new FormData(form)).toString(), null, function(risposta){
                    if ( risposta.readyState === XMLHttpRequest.DONE )

                        switch( risposta.status ){
                            case 200: // ok
                                self.showRisultati(risposta);
                                break;
                            case 400: // bad request
                                alert("Parametro non valido, rifiutato dal server.\nVerrai riportato alla home.");
                                //pageOrchestrator.hide();
                                //pageOrchestrator.showHome();
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
                } );

            else
                // mostro un eventuale errore se il form non è valido
                form.reportValidity();
        }

        // metodo che mostra i risultati
        this.showRisultati = function(risposta){
            let paginaRisultati;
            try {
                paginaRisultati = JSON.parse(risposta.responseText);
            } catch(e) {
                alert("Errore lato client durante il parsing di JSON dei risultati forniti dal server: " + e);
                return;
            }

            // svuoto la pagina
            this.containter.innerHTML = "";
            // se non ci sono risultati mostro un messaggio
            if( paginaRisultati.length === 0 ){
                let p = document.createElement('p');
                p.textContent = "Nessun risultato per la tua ricerca";
                this.containter.appendChild(p);
                return;
            }

            //aggiungo la tabella con i risultati
            let table = document.createElement('table');
            this.containter.appendChild(table);
            let tableHead = document.createElement('thead');
            table.appendChild(tableHead);
            let tableHeaderRow = document.createElement('tr');
            tableHead.appendChild(tableHeaderRow);
            //do il nome alle colonne
            let nomiColonneP = ['Codice','Nome','Prezzo minimo'];
            for( let i=0; i<nomiColonneP.length; i++ ){
                let th = document.createElement('th');
                th.textContent = nomiColonneP[i];
                tableHeaderRow.appendChild(th);
            }


            //aggiungo i risultati alla tabella
            paginaRisultati.risultati.forEach( (r) => {
                // aggiungo il corpo della tabella
                let tableBody = document.createElement('tbody');
                table.appendChild(tableBody);
                //creo la riga
                let tr = document.createElement('tr');
                tableBody.appendChild(tr);

                //inserisco il codice del prodotto come bottone per espandere
                let tdCodice = document.createElement('td');
                tr.appendChild(tdCodice);
                /*let formEspandi = document.createElement('form');
                formEspandi.id = "formEspandi";
                formEspandi.action = "#";
                tdCodice.appendChild(formEspandi);
                let inputEspandi = document.createElement('input');
                inputEspandi.type = "hidden";
                inputEspandi.name = "codiceProdotto";
                inputEspandi.value = r.prodotto.codiceProdotto;
                formEspandi.appendChild(inputEspandi);
                let inputEspandi2 = document.createElement('input');
                inputEspandi2.type = "hidden";
                inputEspandi2.name = "word";
                inputEspandi2.value = word;
                formEspandi.appendChild(inputEspandi2);
                let inputEspandi3 = document.createElement('input');
                inputEspandi3.type = "hidden";
                inputEspandi3.name = "posizione";
                inputEspandi3.value = posizione;
                formEspandi.appendChild(inputEspandi3);*/
                let bottoneEspandi = document.createElement('button');
                bottoneEspandi.classList.add("tableButton");
                bottoneEspandi.textContent = r.prodotto.codiceProdotto + 'r';
                tdCodice.appendChild(bottoneEspandi);
                //bottoneEspandi.addEventListener('click', self.espandi);

                //inserisco il nome del prodotto
                let tdNome = document.createElement('td');
                tdNome.textContent = r.prodotto.nomeProdotto;
                tr.appendChild(tdNome);
                //inserisco il prezzo minimo
                let tdPrezzoMinimo = document.createElement('td');
                tdPrezzoMinimo.textContent = r.prezzoMin;
                tr.appendChild(tdPrezzoMinimo);

                //inserisco le informazioni del proddtto inizialmente nascoste
                let tbodyInfo = document.createElement('tbody');
                tbodyInfo.classList.add("dettagli");
                tbodyInfo.style.display = "none";
                tableBody.appendChild(tbodyInfo);

                //creo la prima riga
                let trInfo1 = document.createElement('tr');
                tbodyInfo.appendChild(trInfo1);
                //inserisco la foto
                let img = document.createElement('img');
                img.src = 'data:image/jpg;base64,' + r.prodotto.fotoBase64;
                img.classList.add('card-img-top');
                trInfo1.appendChild(img);
                //inserisco la descrizione
                let tdDescrizione = document.createElement('td');
                tdDescrizione.textContent = "Categoria: " + r.prodotto.categoria + "\n\nDescrizione: " + r.prodotto.descrizione;
                trInfo1.appendChild(tdDescrizione);

                //aggiungo la lista dei fornitori
                r.fornitori.forEach( (f) => {
                    //creo la riga
                    let trInfo2 = document.createElement('tr');
                    tbodyInfo.appendChild(trInfo2);
                    //inserisco il nome del fornitore
                    let tdNomeFornitore = document.createElement('td');
                    tdNomeFornitore.textContent = f.fornitore.nomeFornitore;
                    trInfo2.appendChild(tdNomeFornitore);
                    //inserisco la valutazione
                    let tdValutazione = document.createElement('td');
                    tdValutazione.textContent = f.fornitore.valutazione;
                    trInfo2.appendChild(tdValutazione);
                    //inserisco le spese di spedizione
                    let tdSpeseSpedizione = document.createElement('td');
                    tdSpeseSpedizione.textContent = "fasce spedizione";
                    trInfo2.appendChild(tdSpeseSpedizione);
                    //inserisco la soglia di spedizione gratuita
                    let tdSogliaSpedizione = document.createElement('td');
                    tdSogliaSpedizione.textContent = f.fornitore.soglia;
                    trInfo2.appendChild(tdSogliaSpedizione);
                    //inserisco i prodotti già nel carrello
                    let tdProdottiCarrello = document.createElement('td');
                    tdProdottiCarrello.textContent = "prodotti carrello";
                    trInfo2.appendChild(tdProdottiCarrello);
                    //inserisco il prezzo già nel carrello
                    let tdPrezzoCarrello = document.createElement('td');
                    tdPrezzoCarrello.textContent = "prezzo carrello";
                    trInfo2.appendChild(tdPrezzoCarrello);
                    //inserisco il prezzo di vendita
                    let tdPrezzoVendita = document.createElement('td');
                    tdPrezzoVendita.textContent = f.prezzoVendita;
                    trInfo2.appendChild(tdPrezzoVendita);
                    //inserisco per aggiungere al carrello
                    let tdAggiungiCarrello = document.createElement('td');
                    tdAggiungiCarrello.textContent = "aggiungi al carrello";
                    trInfo2.appendChild(tdAggiungiCarrello);
                })
            })

            // Seleziona tutti i pulsanti di toggle
            var toggleButtons = document.querySelectorAll('.toggleButton');

            // Itera sui pulsanti e aggiungi un gestore di eventi a ciascuno
            toggleButtons.forEach(function(button) {
                button.addEventListener('click', function() {
                    // Trova il div dei dettagli correlato
                    const dettagli = this.parentNode.parentNode.parentNode.parentNode.querySelector('.dettagli');

                    // Alterna la visualizzazione dei dettagli
                    if (dettagli.style.display === 'none') {
                        dettagli.style.display = 'block';
                    } else {
                        dettagli.style.display = 'none';
                    }
                });
            });

            //aggiungo se necessario il bottone per tornare alla pagina precedente
            if(posizione>0){
                let formPrecedente = document.createElement('form');
                formPrecedente.id = "formPrecedente";
                formPrecedente.action = "#";
                container.appendChild(formPrecedente);
                let inputPrecedente = document.createElement('input');
                inputPrecedente.type = "hidden";
                inputPrecedente.name = "word";
                inputPrecedente.value = word;
                formPrecedente.appendChild(inputPrecedente);
                let inputPrecedente2 = document.createElement('input');
                inputPrecedente2.type = "hidden";
                inputPrecedente2.name = "posizione";
                inputPrecedente2.value = (-5+parseInt(posizione));
                formPrecedente.appendChild(inputPrecedente2);
                let btnPrecedente = document.createElement('button');
                btnPrecedente.type = "submit";
                btnPrecedente.textContent = "Pagina precedente";
                formPrecedente.appendChild(btnPrecedente);
                formPrecedente.addEventListener('submit', ricerca.cerca);
            }

            //aggiungo se necessario il bottone per andare alla pagina successiva
            if(!paginaRisultati.ultimaPagina){
                let formSuccessiva = document.createElement('form');
                formSuccessiva.id = "formPrecedente";
                formSuccessiva.action = "#";
                container.appendChild(formSuccessiva);
                let inputPrecedente = document.createElement('input');
                inputPrecedente.type = "hidden";
                inputPrecedente.name = "word";
                inputPrecedente.value = word;
                formSuccessiva.appendChild(inputPrecedente);
                let inputPrecedente2 = document.createElement('input');
                inputPrecedente2.type = "hidden";
                inputPrecedente2.name = "posizione";
                inputPrecedente2.value = (+5+parseInt(posizione));
                formSuccessiva.appendChild(inputPrecedente2);
                let btnPrecedente = document.createElement('button');
                btnPrecedente.type = "submit";
                btnPrecedente.textContent = "Pagina successiva";
                formSuccessiva.appendChild(btnPrecedente);
                formSuccessiva.addEventListener('submit', ricerca.cerca);
            }

            ////////

            /*// creo la lista (non la aggiungo qui)
            let ul = document.createElement('ul');
            ul.classList.add('listview');

            // aggiungo una riga alla lista per ogni risultato
            for( let i = 0; i<risultati.length; i++ ){
                // aggiungo una riga
                let li = document.createElement('li');
                li.classList.add('listview-row');

                // aggiungo id, nome del prodotto e testo come intestazione della riga
                let a = document.createElement('a');
                let prodotto = document.createTextNode(risultati[i].primo.id + " - " + risultati[i].primo.nome + ": " + (risultati[i].secondo).toFixed(2) + " €")
                a.appendChild(prodotto);
                a.classList.add("listview-row-title");
                li.appendChild(a);
                a.setAttribute("data-idprodotto", risultati[i].primo.id);

                // assegno alla riga del prodotto la funzione per visualizzare e chiamare apriDettagli
                a.onclick = function(e){
                    if( ( e.target.getAttribute("data-opened") === null ) || ( e.target.getAttribute("data-opened") === "false" ) ){
                        e.target.setAttribute("data-opened", true);
                        makeCall("GET", "visualizza?idProdotto=" + e.target.getAttribute("data-idprodotto"), null, function(risposta){
                            if( risposta.readyState === XMLHttpRequest.DONE ){
                                switch( risposta.status ){
                                    case 200: // ok
                                        self.apriDettagli(e.target.parentNode, risposta);
                                        break;
                                    case 400: // bad request
                                        alert("Parametro non valido, rifiutato dal server.\nVerrai riportato alla home.");
                                        pageOrchestrator.hide();
                                        pageOrchestrator.showHome();
                                        break;
                                    case 401: // unauthorized
                                        alert("Non sei loggato.\nVerrai riportato al login.")
                                        logout();
                                        break;
                                    case 500: // server error
                                        alert("Errore nel server.\nVerrai riportato alla home.");
                                        pageOrchestrator.hide();
                                        pageOrchestrator.showHome();
                                        break;
                                    default:
                                        alert("Errore sconosciuto.");
                                        pageOrchestrator.hide();
                                        pageOrchestrator.showHome();
                                        return;
                                }
                            }
                        } );
                    }
                    else{
                        e.target.setAttribute("data-opened", false);
                        self.chiudiDettagli(e.target.parentNode);
                    }

                }

                // aggiungo la riga alla lista
                ul.appendChild(li);
            }

            // aggiungo effettivamente la lista
            this.containter.appendChild(ul);

            /* --- aggiungo il div myModal nel container, la cui posizione a video verrà definita a posteriori --- */
/*
            let divModalContent = document.createElement('div')
            divModalContent.id = "myModal";
            divModalContent.classList.add('modal-content')
            divModalContent.onmouseleave = function(){
                closeModal();
            }
            this.containter.appendChild(divModalContent);

            */
        }


    }

    /************************************************************************************/

    //ordini
    function Ordini(container) {
        this.container = container;

        // metodo che recupera gli ordini
        this.show = function () {
            container.innerHTML = "";
            // salvo this in self per colpa della visibilità di js
            const self = this;

            // se presente la divSearch la tolgo
            let divSearch = document.querySelector('.searchForm');
            if (divSearch)
                divSearch.remove();

            // faccio la chiamata di get per vedere gli ordini
            makeCall("GET", "Ordini", null, function (risposta) {
                if (risposta.readyState === XMLHttpRequest.DONE) {
                    switch (risposta.status) {
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
            });
        }

        // metodo che riempie effettivamente la pagina degli ordini
        this.riempiPaginaOrdini = function (risposta) {
            // prendo gli ordini
            let ordini;
            try {
                ordini = JSON.parse(risposta.responseText);
            } catch (e) {
                alert("Errore lato client durante il parsing di JSON degli ordini forniti dal server: " + e);
                return;
            }

            // se non ci sono ordini non mostro nulla
            if (ordini.length === 0) {
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
            let nomiColonneP = ['Codice ordine', 'Nome fornitore', 'Data spedizione', 'Prezzo totale', 'indirizzo di spedizione'];
            for (let i = 0; i < nomiColonneP.length; i++) {
                let th = document.createElement('th');
                th.textContent = nomiColonneP[i];
                tableHeaderRow.appendChild(th);
            }
            // aggiungo il corpo della tabella
            let tableBody = document.createElement('tbody');
            table.appendChild(tableBody);

            // per ogni ordine, aggiungo un elemento alla lista
            ordini.forEach((o) => {

                // aggiungo una riga per l'ordine alla tabella
                let rigaOrdine = document.createElement('tr');
                tableBody.appendChild(rigaOrdine);
                // aggiungo il codice ordine alla riga
                let tdCodiceOrdine = document.createElement('td');
                tdCodiceOrdine.textContent = o.ordine.codiceOrdine;
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
                let nomiColonneP = ['Prodotti:', 'Quantità:'];
                for (let i = 0; i < nomiColonneP.length; i++) {
                    let td = document.createElement('td');
                    td.textContent = nomiColonneP[i];
                    rigaInformazioni.appendChild(td);
                }

                // gestisco i prodotti in ogni ordine
                o.informazioni.forEach((i) => {
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