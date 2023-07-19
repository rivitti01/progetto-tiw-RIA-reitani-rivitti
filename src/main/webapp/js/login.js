

(function() { // avoid variables ending up in the global scope

    // se quando la pagina carica non sono loggato chiamo logout, altrimenti visualizzo la home
        if( sessionStorage.getItem("email") != null ){
            window.location.href = "home.html";
        }



    document.getElementById("submit").addEventListener('click', (e) => {
        e.preventDefault();
        var form = e.target.closest("form");
        if (form.checkValidity()) {
            makeCall("POST", 'Login',e.target.closest("form"), function(x) {
                    if (x.readyState == XMLHttpRequest.DONE) {
                        var message = x.responseText;
                        switch (x.status) {
                            case 200:
                                sessionStorage.setItem('email', message);
                                window.location.href = "home.html";
                                break;
                            case 400: // bad request
                                document.getElementById("errormessage").textContent = "Email o password errati";
                                break;
                            case 401: // unauthorized
                                document.getElementById("errormessage").textContent = "Email o password errati";
                                break;
                            case 500: // server error
                                document.getElementById("errormessage").textContent = "Errore lato server riprovare più tardi";
                                break;
                        }
                    }
                }
            );
        } else {
            form.reportValidity();
        }
    });

})();