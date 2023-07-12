sessionStorage.clear();

{
    //#####MAPPIAMO LE FUNZIONI AI BOTTONI#####

    // aggiungo la funzione al click del bottone di logout
    document.getElementById("logout").addEventListener("click", function(){
        logout();
    });

    //#####DICHIARIAMO LE FUNZIONI#####

    function logout() {
        makeCall("GET", 'Logout', null, function (risposta) {
            if (risposta.readyState === XMLHttpRequest.DONE) {
                sessionStorage.clear();
                window.location.href = "index.html";
            }
        });
    }


}