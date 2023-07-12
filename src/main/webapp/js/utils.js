function makeCall(method, url, formElement, cback, reset = true) {
    var req = new XMLHttpRequest(); // visible by closure
    req.onreadystatechange = function() {
        cback(req)
    }; // closure
    req.open(method, url);
    if (formElement == null) {
        req.send();
    } else {
        req.send(new FormData(formElement));
    }
    if (formElement !== null && reset === true) {
        formElement.reset();
    }
}

// manda una richiesta http di POST, passando obj come parametro e specificando la callback callback
function postJsonData(url, obj, callback, toBeStringified = true) {
    // creo un oggetto HttpRequest
    var richiesta = new XMLHttpRequest();

    // definisco la callback da eseguire al termine della richiesta
    richiesta.onreadystatechange = function() {
        callback(richiesta)
    };

    // inizializzo la richiesta
    richiesta.open("POST", url);

    // imposto il content-type della richiesta
    richiesta.setRequestHeader("Content-Type", "application/json");

    // invio la richiesta
    if( toBeStringified )
        richiesta.send(JSON.stringify(obj));
    else
        richiesta.send(obj);
}
