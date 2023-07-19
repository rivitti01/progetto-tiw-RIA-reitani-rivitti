package controllers;

import beans.Vende;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;
import dao.FasceDAO;
import dao.FornitoreDAO;
import dao.ProdottoDAO;
import dao.VendeDAO;
import utils.CarrelloFornitore;
import utils.ProdottoCarrello;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.lang.reflect.Type;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/Carrello")
@MultipartConfig
public class CarrelloServlet extends ServletPadre {

    public CarrelloServlet() {
        super();
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        Map<Integer, CarrelloFornitore> carrello;

        // imposto la codifica per leggere i parametri, coerentemente all'HTML
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        // leggo la stringa in input
        BufferedReader reader = request.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null)
            sb.append(line);
        String requestBody = sb.toString();

        // creo un oggetto gson
        Gson gson = new Gson();

        // prendo il token della classe da ritornare
        Type typeToken = new TypeToken<Map<Integer, CarrelloFornitore>>() {
        }.getType();
        // e converto da JSON
        try {
            carrello = gson.fromJson(requestBody, typeToken);
        } catch (JsonSyntaxException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        //controllo se ogni quantità sia maggiore di 0
        for (int idFornitore : carrello.keySet()){
            CarrelloFornitore carrelloFornitore = carrello.get(idFornitore);
            for (int i = 0; i < carrelloFornitore.getProdottiCarrello().size(); i++){
                if (carrelloFornitore.getProdottiCarrello().get(i).getQuantita() <= 0){
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }
            }
        }



        for (int idFornitore : carrello.keySet()) {
            CarrelloFornitore carrelloFornitore = carrello.get(idFornitore);
            for (int i = 0; i < carrelloFornitore.getProdottiCarrello().size(); i++){
                for (int j = 0; j < carrelloFornitore.getProdottiCarrello().size(); j++){
                    if (i != j && carrelloFornitore.getProdottiCarrello().get(i).getCodiceProdotto() == carrelloFornitore.getProdottiCarrello().get(j).getCodiceProdotto()){
                        carrelloFornitore.getProdottiCarrello().get(i).setQuantita(carrelloFornitore.getProdottiCarrello().get(i).getQuantita() + carrelloFornitore.getProdottiCarrello().get(j).getQuantita());
                        carrelloFornitore.getProdottiCarrello().get(j).setQuantita(0);
                    }
                }
            }
        }

        for (int idFornitore : carrello.keySet()){
            CarrelloFornitore carrelloFornitore = carrello.get(idFornitore);
            for (int i = 0; i < carrelloFornitore.getProdottiCarrello().size(); i++){
                if (carrelloFornitore.getProdottiCarrello().get(i).getQuantita() == 0){
                    carrelloFornitore.getProdottiCarrello().remove(i);
                    i--;
                }
            }
        }



        FornitoreDAO fornitoreDAO = new FornitoreDAO(connection);
        ProdottoDAO prodottoDAO = new ProdottoDAO(connection);
        VendeDAO vendeDAO = new VendeDAO(connection);
        // faccio i controlli sul carrello
        try {
            for (int idFornitore : carrello.keySet()) {

                // controllo che chiave e valore siano coerenti
                if (idFornitore != carrello.get(idFornitore).getCodiceFornitore()) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }

                // controllo che il fornitore esista
                if (fornitoreDAO.getFornitore(idFornitore) == null) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }

                //controllo i prodotti
                for (ProdottoCarrello prodotto : carrello.get(idFornitore).getProdottiCarrello()) {

                    //controllo che il prodotto esista
                    if(prodottoDAO.getProdottoByCodiceProdotto(prodotto.getCodiceProdotto())==null){
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        return;
                    }

                    //controllo che quel fornitore venda quel prodotto
                    if(vendeDAO.getPrice(prodotto.getCodiceProdotto(), idFornitore)==-1){
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        return;
                    }

                    //controllo che la quantità sia maggiore di 0
                    if(prodotto.getQuantita()<=0){
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        return;
                    }
                }

            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Error while querying db. Retry later");
            return;
        }// se arrivo qui, il carrello è valido

        // completo il carrello con tutte le informazioni necessarie
        FasceDAO fasceDAO = new FasceDAO(connection);
        try {
            // per ogni fornitore nel carrello completo i suoi dati
            for (int idFornitore : carrello.keySet()) {
                //inizializzo i suoi dati
                carrello.get(idFornitore).setPrezzoTotaleProdotti(0);
                carrello.get(idFornitore).setQuantitaTotaleProdotti(0);

                //inserisco il nome
                carrello.get(idFornitore).setNomeFornitore(fornitoreDAO.getFornitore(idFornitore).getNomeFornitore());

                //per ogni prodotto nel carrello completo i suoi dati
                for (ProdottoCarrello prodotto : carrello.get(idFornitore).getProdottiCarrello()) {
                    //aggiorna la quantità totale
                    carrello.get(idFornitore).setQuantitaTotaleProdotti(carrello.get(idFornitore).getQuantitaTotaleProdotti() + prodotto.getQuantita());

                    //aggiorna il prezzo totale
                    carrello.get(idFornitore).setPrezzoTotaleProdotti(carrello.get(idFornitore).getPrezzoTotaleProdotti() + (vendeDAO.getPrice(prodotto.getCodiceProdotto(), idFornitore) * prodotto.getQuantita()));

                    //inserisco il nome
                    prodotto.setNomeProdotto(prodottoDAO.getProdottoByCodiceProdotto(prodotto.getCodiceProdotto()).getNomeProdotto());
                }

                //aggiorno il prezzo della spedizione
                if (carrello.get(idFornitore).getPrezzoTotaleProdotti() > fornitoreDAO.getFornitore(idFornitore).getSoglia()) {
                    carrello.get(idFornitore).setPrezzoSpedizione(0);
                }else{
                    int spedizione = fasceDAO.getPrice(idFornitore, carrello.get(idFornitore).getQuantitaTotaleProdotti());
                    if(spedizione!=-1) {
                        carrello.get(idFornitore).setPrezzoSpedizione(spedizione);
                    }else
                        carrello.get(idFornitore).setPrezzoSpedizione(fornitoreDAO.getFornitore(idFornitore).getSpedizioneMin());
                }
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Error while querying db. Retry later");
            return;
        }

        String json = gson.toJson(carrello);
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(json);
    }
}
