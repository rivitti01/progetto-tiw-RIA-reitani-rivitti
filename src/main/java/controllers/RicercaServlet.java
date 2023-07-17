package controllers;

import javax.servlet.annotation.WebServlet;

import beans.*;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import dao.*;
import utils.PaginaRisultati;
import utils.Risultato;
import utils.CarrelloFornitore;
import utils.FornitoreConProdotto;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/Ricerca")
public class RicercaServlet extends ServletPadre {
    public RicercaServlet() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {


        String word = request.getParameter("word");

        //Verifica che word sia presente
        if (word == null || word.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("il campo di ricerca è vuoto");
            return;
        }

        //verifico che la posizione di partenza sia un numero
        int posizione;
        try{
            posizione = Integer.parseInt(request.getParameter("posizione"));
        }catch (NumberFormatException ex){
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "la posizione di partenza non è un numero");
            return;
        }

        //verifico che la posizione di partenza sia un numero positivo
        if(posizione < 0){
            posizione = 0;
        }

        //ricerca i prodotti per parola
        RisultatoDAO risultatoDAO = new RisultatoDAO(connection);
        List<Risultato> risultati;
        try {
            risultati = risultatoDAO.searchByWord(word, posizione);
        } catch (SQLException e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Query ricerca fallita");
            return;
        }




        //verifico che non sia l'ultima pagina da caricare
        boolean isLastPage;
        if(risultati.size() == 6){
            isLastPage = false;
            risultati.remove(5);
        }else {
            isLastPage = true;
        }
        PaginaRisultati paginaRisultati = new PaginaRisultati();
        paginaRisultati.setUltimaPagina(isLastPage);

        //inserisco i risultati nella pagina
        paginaRisultati.setRisultati(risultati);


        for (Risultato risultato : risultati){
            //inserisco la lista dei fornitori per ogni risultato
            try {
                risultato.setFornitori(getFornitoriPerProdotto(risultato.getProdotto().getCodiceProdotto()));
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        }





        HttpSession session = request.getSession();
        //Verifico che già esista un carrello nella sessione. Se non esiste lo creo
        HashMap<Integer, CarrelloFornitore> carrello = (HashMap<Integer, CarrelloFornitore>) session.getAttribute("carrello");
        if (carrello == null) {
            carrello = new HashMap<Integer, CarrelloFornitore>();
        }




        // creo un oggetto gson
        Gson gson = new GsonBuilder().setDateFormat("dd/MM/yyyy").create();
        // scrivo la stringa in json
        String json = gson.toJson(paginaRisultati);
        // ritorno il risultato
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().println(new Gson().toJson(paginaRisultati));



    }

    private List<FornitoreConProdotto> getFornitoriPerProdotto(int codiceProdotto) throws SQLException {
        VendeDAO vendeDAO = new VendeDAO(connection);
        FasceDAO fasceDAO = new FasceDAO(connection);
        List<Fornitore> fornitori = vendeDAO.getFornitori(codiceProdotto);
        List<FornitoreConProdotto> listaFornitoriConProdotto = new ArrayList<>();
        for (Fornitore fornitore : fornitori){
            FornitoreConProdotto fornitoreConProdotto = new FornitoreConProdotto();
            fornitoreConProdotto.setFornitore(fornitore);
            fornitoreConProdotto.setPrezzoVendita(vendeDAO.getPrice(codiceProdotto, fornitore.getCodiceFornitore()));
            fornitoreConProdotto.getFornitore().setFasce(fasceDAO.getFasce(fornitore.getCodiceFornitore()));
            listaFornitoriConProdotto.add(fornitoreConProdotto);
        }
        return listaFornitoriConProdotto;
    }


}
