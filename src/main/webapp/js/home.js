

{
    /************************************************************************************/

    // dichiaro il pageOrchestrator e le variabili che conterranno i componenti della pagina
    let home, ricerca, carrello, ordini;
    let pageOrchestrator = new PageOrchestrator();

    class FornitoreCarrello  {
        constructor(codiceFornitore) {
            this.codiceFornitore = codiceFornitore;
            this.nomeFornitore = null;
            this.prezzoSpedizione = null;
            this.prezzoTotaleProdotti = null;
            this.quantitaTotaleProdotti = null;
            this.prodottiCarrello = null;
        }

    };


    class ProdottoCarrello  {
        constructor(quantita, codiceProdotto, codiceFornitore) {
            this.quantita = quantita;
            this.codiceProdotto = codiceProdotto;
            this.codiceFornitore = codiceFornitore;
            this.nomeProdotto = null;
        }
    };

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
            carrello = new Carrello(this.container);
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
    function Carrello(container){
        this.container = container;

        this.show = function() {
            container.innerHTML = "";
            let self = this;
            let carrello = JSON.parse(sessionStorage.getItem("carrello"));
            if (carrello == null || carrello.size === 0) {
                // mostro un messaggio se il carrello è vuoto
                let span = document.createElement("span");
                let h1 = document.createElement("h1");
                h1.textContent = "Il tuo carrello è ancora vuoto!";
                span.appendChild(h1);
                this.container.appendChild(span);
            }else{
                //aggiorno il carrello per stamparlo
                this.aggiornaCarrello();
            }

        }

        this.stampaCarrello = function(){
            let self = this;
            let carrello = JSON.parse(sessionStorage.getItem("carrello"));

            //mostro il carrello
            let divCenteredRow = document.createElement("div");
            container.appendChild(divCenteredRow);
            divCenteredRow.classList.add("centered-row");
            let table = document.createElement("table");
            divCenteredRow.appendChild(table);
            let caption = document.createElement("caption");
            divCenteredRow.appendChild(table);
            caption.textContent = "Ecco il tuo carrello";
            table.appendChild(caption);
            for( var[key,value] of carrello) {
                let tableBody = document.createElement("tbody");
                table.appendChild(tableBody);
                let tr = document.createElement("tr");
                tr.classList.add("separator");
                tableBody.appendChild(tr);
                let th = document.createElement("th");
                th.colSpan = 4;
                th.textContent = value.nomeFornitore;
                tr.appendChild(th);
                /*for (let j = 0; j < carrello.get(Array.from(carrello.keys())[i]).length; j++) {
                    let tr2 = document.createElement("tr");
                }*/
            };
        }

        this.aggiornaCarrello = function(){
            let self = this;
            let carrello = JSON.parse(sessionStorage.getItem("carrello"));

            postJsonData('Carrello', carrello , function(risposta) {
                if ( risposta.readyState === XMLHttpRequest.DONE )

                    switch( risposta.status ){
                        case 200: // ok
                            //aggiorno il carrello
                            let json = risposta.responseText;
                            let carrello = JSON.parse(json);
                            let mappaCarrello = new Map(Object.entries(carrello))
                            sessionStorage.setItem("carrello", JSON.stringify(Array.from(mappaCarrello.entries())));
                            //stampo il carrello
                            self.stampaCarrello();
                            break;
                        case 400: // bad request
                            alert("Parametro non valido, rifiutato dal server.\nVerrai riportato alla home.");
                            home.show();
                            break;
                        case 401: // unauthorized
                            alert("Non sei loggato.\nVerrai riportato al login.");
                            logout();
                            break;
                        case 500: // server error
                            alert("Errore nel server.\nVerrai riportato alla home.");
                            home.show();
                            break;
                        default:
                            alert("Errore sconosciuto.");
                            //pageOrchestrator.hide();
                            //pageOrchestrator.showHome();
                            break;
                    }
            } );



        }

        this.aggiungiAlCarrello = function(prodotto){
            let self = this;
            let prodotti = [];
            let fornitoreCarrello;
            let carrello;
            if( sessionStorage.getItem("carrello") != null ){
                //prendo il carrello dalla sessione se esiste
                carrello = new Map(JSON.parse(sessionStorage.getItem("carrello")));
                if (carrello.get(prodotto.codiceFornitore)!=null){
                    //se il fornitore è già presente nel carrello lo prendo
                    fornitoreCarrello = carrello.get(prodotto.codiceFornitore);
                    //prendo i prodotti del fornitore
                    prodotti = fornitoreCarrello.prodottiCarrello;
                }else{
                    //se il fornitore non è presente nel carrello lo creo
                    fornitoreCarrello = new FornitoreCarrello(prodotto.codiceFornitore);
                }
            }else {
                //se il carrello non esiste lo creo
                carrello = new Map();
                //creo il fornitore nel carrello
                fornitoreCarrello = new FornitoreCarrello(prodotto.codiceFornitore);
            }
            //aggiungo il prodotto al fornitore
            prodotti.push(prodotto);
            fornitoreCarrello.prodottiCarrello = prodotti;
            //aggiungo il fornitore al carrello
            carrello.set(prodotto.codiceFornitore, fornitoreCarrello);
            //aggiungo il carrello alla sessione
            sessionStorage.setItem("carrello", JSON.stringify(Array.from(carrello.entries())));

            this.show();
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

                                //rimuovo la barra di ricerca
                                let divSearch = document.querySelector('.searchForm');
                                if (divSearch)
                                    divSearch.remove();
                                //chiamo la funzione che stampa la pagina risultati
                                self.showRisultati(risposta);
                                break;
                            case 400: // bad request
                                alert("Parametro non valido, rifiutato dal server.\nVerrai riportato alla home.");
                                home.show();
                                break;
                            case 401: // unauthorized
                                alert("Non sei loggato.\nVerrai riportato al login.");
                                logout();
                                break;
                            case 500: // server error
                                alert("Errore nel server.\nVerrai riportato alla home.");
                                home.show();
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

        this.espandi = function(e){
            e.preventDefault();
            console.log(e.target.textContent);
            const dettagli = this.parentNode.parentNode.parentNode.parentNode.querySelector('.dettagli'+e.target.textContent);

            if (dettagli.style.display === 'none') {
                dettagli.style.display = 'block';

                //invio al server che il prodotto è stato visualizzato, solo quando viene espanso, anche se sono contemplati inserimenti multipli dello stesso prodotto nel db
                let call = "codiceProdotto=" + e.target.textContent+"&email="+sessionStorage.getItem("email");
                makeCall("GET", "Visualizza?"+call, null, function(risposta){
                    if ( risposta.readyState === XMLHttpRequest.DONE ) {
                        switch( risposta.status ){
                            case 200: // ok
                                break;
                            case 400: // bad request
                                alert("Parametro non valido, rifiutato dal server.\nVerrai riportato alla home.");
                                home.show();
                                break;
                            case 401: // unauthorized
                                alert("Non sei loggato.\nVerrai riportato al login.");
                                logout();
                                break;
                            case 500: // server error
                                alert("Errore nel server.\nVerrai riportato alla home.");
                                home.show();
                                break;
                            default:
                                alert("Errore sconosciuto.");
                                break;
                        }
                    }
                } );

            } else {
                dettagli.style.display = 'none';
            }

        }

        this.carrello = function(e){
            e.preventDefault();
            var form = e.target;
            let quantita = form.elements["quantita"].value;
            let codiceProdotto = form.elements["codiceProdotto"].value;
            let codiceFornitore = form.elements["codiceFornitore"].value;

            let prodottoCarrello = new ProdottoCarrello(quantita, codiceProdotto, codiceFornitore);
            carrello.aggiungiAlCarrello(prodottoCarrello);

        }

        // metodo che mostra i risultati
        this.showRisultati = function(risposta){
            let carrello = new Map(JSON.parse(sessionStorage.getItem("carrello")));
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
                let bottoneEspandi = document.createElement('button');
                bottoneEspandi.classList.add("tableButton");
                bottoneEspandi.textContent = r.prodotto.codiceProdotto;
                bottoneEspandi.addEventListener('click', self.espandi);
                tdCodice.appendChild(bottoneEspandi);
                //bottoneEspandi.addEventListener('click', self.espandi);

                //inserisco il nome del prodotto
                let tdNome = document.createElement('td');
                tdNome.textContent = r.prodotto.nomeProdotto;
                tr.appendChild(tdNome);
                //inserisco il prezzo minimo
                let tdPrezzoMinimo = document.createElement('td');
                tdPrezzoMinimo.textContent = r.prezzoMin+"€";
                tr.appendChild(tdPrezzoMinimo);

                //inserisco le informazioni del proddtto inizialmente nascoste
                let tbodyInfo = document.createElement('div');
                tbodyInfo.classList.add("dettagli"+r.prodotto.codiceProdotto);
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
                //inserisco le info
                let tdInfo = document.createElement('td');
                trInfo1.appendChild(tdInfo);
                //inserisco la categoria
                let pCategoria = document.createElement('p');
                pCategoria.textContent = "Categoria: " + r.prodotto.categoria;
                tdInfo.appendChild(pCategoria);
                //inserisco la descrizione
                let pDescrizione = document.createElement('p');
                pDescrizione.textContent = "Descrizione: " + r.prodotto.descrizione;
                tdInfo.appendChild(pDescrizione);

                //aggiungo il nome delle tabelle dei fornitori
                let trTitoli = document.createElement('tr');
                tbodyInfo.appendChild(trTitoli);
                let tdNomeFornitori = document.createElement('td');
                tdNomeFornitori.textContent = "Nome fornitore";
                trTitoli.appendChild(tdNomeFornitori);
                let tdValutazione = document.createElement('td');
                tdValutazione.textContent = "Valutazione";
                trTitoli.appendChild(tdValutazione);
                let tdSpeseSpedizione = document.createElement('td');
                tdSpeseSpedizione.textContent = "Spese di spedizione";
                trTitoli.appendChild(tdSpeseSpedizione);
                let tdSogliaSpedizione = document.createElement('td');
                tdSogliaSpedizione.textContent = "Soglia di spedizione gratuita";
                trTitoli.appendChild(tdSogliaSpedizione);
                let tdProdottiCarrello= document.createElement('td');
                tdProdottiCarrello.textContent = "Prodotti già nel carrello";
                trTitoli.appendChild(tdProdottiCarrello);
                let tdPrezzoCarrello = document.createElement('td');
                tdPrezzoCarrello.textContent = "Prezzo nel carrello";
                trTitoli.appendChild(tdPrezzoCarrello);
                let tdPrezzo = document.createElement('td');
                tdPrezzo.textContent = "Prezzo";
                trTitoli.appendChild(tdPrezzo);
                let tdAggiungi = document.createElement('td');
                tdAggiungi.textContent = "Aggiungi al carrello";
                trTitoli.appendChild(tdAggiungi);

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
                    trInfo2.appendChild(tdSpeseSpedizione);
                    //inserisco le fasce di spedizione
                    f.fornitore.fasce.forEach ( (fascia) => {
                        //inserisco la singola fascia
                        let divFascia = document.createElement('div');
                        divFascia.textContent ="tra "+ fascia.min + " e " + fascia.max + " il prezzo è: "+ fascia.prezzo +"€";
                        tdSpeseSpedizione.appendChild(divFascia);
                    })
                    //inserisco il prezzo minimo di spedizione
                    let divPrezzoMinimoSpedizione = document.createElement('div');
                    divPrezzoMinimoSpedizione.textContent = "oltre: " + f.fornitore.spedizioneMin + "€";
                    tdSpeseSpedizione.appendChild(divPrezzoMinimoSpedizione);
                    //inserisco la soglia di spedizione gratuita
                    let tdSogliaSpedizione = document.createElement('td');
                    tdSogliaSpedizione.textContent = f.fornitore.soglia+ "€";
                    trInfo2.appendChild(tdSogliaSpedizione);
                    //inserisco i prodotti già nel carrello
                    let tdProdottiCarrello = document.createElement('td');
                    //tdProdottiCarrello.textContent = "prodotti carrello";
                    if (carrello.keys().has(f.fornitore.codiceFornitore)){
                        tdProdottiCarrello.textContent = carrello.get(f.fornitore.codiceFornitore).quantitaTotaleProdotti.toString();
                    } else {
                        tdProdottiCarrello.textContent = "0";
                    }
                    trInfo2.appendChild(tdProdottiCarrello);
                    //inserisco il prezzo già nel carrello
                    let tdPrezzoCarrello = document.createElement('td');
                    tdPrezzoCarrello.textContent = "prezzo carrello";
                    trInfo2.appendChild(tdPrezzoCarrello);
                    //inserisco il prezzo di vendita
                    let tdPrezzoVendita = document.createElement('td');
                    tdPrezzoVendita.textContent = f.prezzoVendita+"€";
                    trInfo2.appendChild(tdPrezzoVendita);

                    //inserisco il form e il bottone per aggiungere al carrello
                    let tdAggiungiCarrello = document.createElement('td');
                    trInfo2.appendChild(tdAggiungiCarrello);
                    let formAggiungiCarrello = document.createElement('form');
                    formAggiungiCarrello.classList.add("formCarrello");
                    formAggiungiCarrello.id = "formCarrello";
                    formAggiungiCarrello.action = "#";
                    tdAggiungiCarrello.appendChild(formAggiungiCarrello);
                    let inputAggiungiCarrello = document.createElement('input');
                    inputAggiungiCarrello.type = "hidden";
                    inputAggiungiCarrello.name = "codiceProdotto";
                    inputAggiungiCarrello.value = r.prodotto.codiceProdotto;
                    formAggiungiCarrello.appendChild(inputAggiungiCarrello);
                    let inputAggiungiCarrello2 = document.createElement('input');
                    inputAggiungiCarrello2.type = "hidden";
                    inputAggiungiCarrello2.name = "codiceFornitore";
                    inputAggiungiCarrello2.value = f.fornitore.codiceFornitore;
                    formAggiungiCarrello.appendChild(inputAggiungiCarrello2);
                    let inputAggiungiCarrello3 = document.createElement('input');
                    inputAggiungiCarrello3.type = "text";
                    inputAggiungiCarrello3.name = "quantita";
                    inputAggiungiCarrello3.placeholder = "quantita";
                    inputAggiungiCarrello3.required = true;
                    formAggiungiCarrello.appendChild(inputAggiungiCarrello3);
                    let bottoneAggiungiCarrello = document.createElement('button');
                    bottoneAggiungiCarrello.type = "submit";
                    bottoneAggiungiCarrello.textContent = "Aggiungi al carrello";
                    formAggiungiCarrello.appendChild(bottoneAggiungiCarrello);
                    formAggiungiCarrello.addEventListener('submit', self.carrello);
                })
            })

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