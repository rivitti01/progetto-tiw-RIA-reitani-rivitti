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

    //home
    function Home(container) {
        this.container = container;
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
            // aggiungo il corpo della tabella
            let tableBody = document.createElement('tbody');
            table.appendChild(tableBody);

            //aggiungo i risultati alla tabella
            paginaRisultati.risultati.forEach( (r) => {
                //creo la riga
                let tr = document.createElement('tr');
                tableBody.appendChild(tr);
                //inserisco il codice del prodotto
                let tdCodice = document.createElement('td');
                tdCodice.textContent = r.codiceProdotto;
                tr.appendChild(tdCodice);
                //inserisco la categoria
                let tdNome = document.createElement('td');
                tdNome.textContent = r.nomeProdotto;
                tr.appendChild(tdNome);
                //inserisco il prezzo minimo
                let tdPrezzoMinimo = document.createElement('td');
                tdPrezzoMinimo.textContent = r.prezzo;
                tr.appendChild(tdPrezzoMinimo);
            })

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