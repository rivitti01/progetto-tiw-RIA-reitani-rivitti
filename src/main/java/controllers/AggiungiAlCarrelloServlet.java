package controllers;

import beans.CarrelloFornitore;
import dao.CarrelloFornitoreDAO;
import dao.FornitoreDAO;
import dao.ProdottoDAO;
import dao.VendeDAO;
import org.thymeleaf.context.WebContext;

import java.io.IOException;
import java.sql.SQLException;
import java.util.HashMap;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/AggiungiAlCarrello")
public class AggiungiAlCarrelloServlet extends ServletPadre{

    public AggiungiAlCarrelloServlet() {
        super();
    }


    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        ProdottoDAO prodottoDAO = new ProdottoDAO(connection);
        FornitoreDAO fornitoreDAO = new FornitoreDAO(connection);

        //controlla che il codice del fornitore sia un numero
        int IDFornitore;
        try {
            IDFornitore = Integer.parseInt(request.getParameter("codiceFornitore"));
        } catch (NumberFormatException ex) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("il codice fornitore non è un numero");
            return;
        }

        //controllo che il fornitore esista
        try {
            if(fornitoreDAO.getFornitore(IDFornitore) == null){
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().println("il fornitore non esiste");
                return;
            }
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }


        //controllo che il codice del prodotto sia un numero
        int IDProdotto;
        try {
            IDProdotto = Integer.parseInt(request.getParameter("codiceProdotto"));
        } catch (NumberFormatException ex) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("il codice prodotto non è un numero");
            return;
        }

        //controllo che il prodotto esista
        try{
            if(prodottoDAO.getInformation(IDProdotto) == null){
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().println("il prodotto non esiste");
                return;
            }
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }

        //controllo che la quantità sia un numero
        int quantità;
        try {
            quantità = Integer.parseInt(request.getParameter("quantità"));
        } catch (NumberFormatException ex) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("la quantità non è un numero");
            return;
        }

        //controllo che la quantità sia maggiore di 0
        if(quantità <= 0){
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("la quantità non può essere minore di 1");
            return;
        }

        //controllo che il fornitore venda quel prodotto
        VendeDAO vendeDAO = new VendeDAO(connection);
        try {
            if(vendeDAO.getPrice(IDProdotto,IDFornitore) == -1){
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().println("il fornitore non vende il prodotto selezionato");
                return;
            }
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }

        //Verifico che già esista un carrello nella sessione. Se non esiste lo creo
        HashMap<Integer, CarrelloFornitore> carrello = (HashMap<Integer, CarrelloFornitore>) session.getAttribute("carrello");
        if (carrello == null) {
            carrello = new HashMap<Integer, CarrelloFornitore>();
        }

        //prendo il carrello del fornitore, se non c'è lo creo
        CarrelloFornitore carrelloFornitore = carrello.get(IDFornitore);
        if (!carrello.keySet().contains(IDFornitore)) {
            try {
                carrelloFornitore = new CarrelloFornitore(fornitoreDAO.getFornitore(IDFornitore));
                carrello.put(IDFornitore, carrelloFornitore);
            } catch (SQLException e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().println("Errore nella creazione del cartello del fornitore");
                return;
            }
        }

        //aggiungo il prodotto al carrello
        CarrelloFornitoreDAO carrelloFornitoreDAO = new CarrelloFornitoreDAO(carrelloFornitore);
        try {
            carrelloFornitoreDAO.addProdotto(prodottoDAO.getInformation(IDProdotto), quantità, connection);
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Errore nel caricamento del prodotto nel carrello");
            return;
        }

        //aggiorno il carrello nella sessione
        session.setAttribute("carrello", carrello);

        //aggiorno la pagina
        String path = getServletContext().getContextPath() + "/Carrello";
        response.sendRedirect(path);
    }

}
