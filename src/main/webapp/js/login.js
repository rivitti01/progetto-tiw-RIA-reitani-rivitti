(function (){
    var form;

    //se l'utente è ancora loggato, allora lo rimando alla pagina home
    if(localStorage.getItem("utente") != null){
        window.location.href = "home.html";
    }
    document.getElementById("errormessage").style.display = "none";

    //altrimenti mando gli elementi del form al server
        form = document.getElementById("formLogin");

        //funzione di submit della form
        form.addEventListener("submit", (e) =>{
            //impedisco l'azione di default di submit
            e.preventDefault();
            //se la form è valida
            if (form.checkValidity()){
                //chiamo la servlet /login
                makeCall("POST",'Login',form,function (response){
                    if (response.readyState == XMLHttpRequest.DONE){
                        switch (response.status){
                            case 200 : //tutto apposto
                                localStorage.setItem("user",response.responseText);
                                window.location.href = "home.html";
                                break;
                            case 400: //errore client side
                                document.getElementById("errormessage").style.display = "block";
                                document.getElementById("errormessage").textContent = "Bad request";
                                break;
                            case 401: // unauthorized
                                document.getElementById("errormessage").style.display = "block";
                                document.getElementById("errormessage").textContent = "Unauthorized";
                                break;
                            case 500: // brutto brutto server side
                                document.getElementById("errormessage").style.display = "block";
                                document.getElementById("errormessage").textContent = "Server error";
                                break;
                        }
                    }
                });
            }else {
                //form non valido
                form.reportValidity();
            }


        });


    })();