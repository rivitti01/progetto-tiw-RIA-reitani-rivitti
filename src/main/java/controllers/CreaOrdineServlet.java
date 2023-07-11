package controllers;

import beans.CarrelloFornitore;
import beans.Informazioni;
import beans.Ordine;
import beans.Prodotto;
import dao.InformazioniDAO;
import dao.OrdineDAO;
import dao.UtenteDAO;
import dao.VendeDAO;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.sql.Date;
import java.sql.SQLException;
import java.util.HashMap;

@WebServlet("/CreaOrdine")
public class CreaOrdineServlet extends ServletPadre{

    public CreaOrdineServlet() {
        super();
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        HttpSession session = request.getSession();

        //controlla che il codice del fornitore sia un numero
        int IDFornitore;
        try {
            IDFornitore = Integer.parseInt(request.getParameter("codiceFornitore"));
        } catch (NumberFormatException ex) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("il codice fornitore non è un numero");
            return;
        }

        //controllo che il fornitore sia presente nel carrello
        HashMap<Integer, CarrelloFornitore> carrello = (HashMap<Integer, CarrelloFornitore>) session.getAttribute("carrello");
        if(!carrello.containsKey(IDFornitore)){
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("il fornitore non è presente nel carrello");
            return;
        }

        //creo un nuovo ordine per quel fornitore
        try {
            //creo l'oggetto ordine
            connection.setAutoCommit(false);
            Ordine ordine = new Ordine();
            ordine.setNomeFornitore(carrello.get(IDFornitore).getFornitore().getNomeFornitore());
            ordine.setEmail(session.getAttribute("email").toString());
            ordine.setDataSpedizione(new Date(System.currentTimeMillis()+ 259200000));
            ordine.setPrezzoTotale(carrello.get(IDFornitore).getPrezzoTotaleProdotti() + carrello.get(IDFornitore).getPrezzoSpedizione());
            ordine.setIndirizzoSpedizione(new UtenteDAO(connection).getIndirizzoByEmail(session.getAttribute("email").toString()));

            //inserisco l'ordine nel database
            OrdineDAO ordineDAO = new OrdineDAO(connection);
            ordineDAO.createOrder(ordine);

            //prendo il codice dell'ordine appena inserito
            int codiceOrdine = ordineDAO.getCodiceUltimoOrdine(session.getAttribute("email").toString());

            //creo l'oggetto informazioni per ogni prodotto nel nuovo ordine
            InformazioniDAO informazioniDAO = new InformazioniDAO(connection);
            for(Prodotto prodotto : carrello.get(IDFornitore).getProdotti().keySet() ){
                Informazioni informazione = new Informazioni();
                informazione.setCodiceOrdine(codiceOrdine);
                informazione.setCodiceProdotto(prodotto.getCodiceProdotto());
                informazione.setFoto(prodotto.getFoto());
                informazione.setNome(prodotto.getNomeProdotto());
                informazione.setQuantità(carrello.get(IDFornitore).getProdotti().get(prodotto));
                informazione.setPrezzoUnitario(new VendeDAO(connection).getPrice(prodotto.getCodiceProdotto(), IDFornitore));

                //inserisco l'informazione nel database
                informazioniDAO.inserisciInformazioni(informazione);
            }
            connection.setAutoCommit(true);
        } catch (SQLException e) {
            try {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().println("Errore nella creazione dell'ordine\n\n" + e.getMessage() + "\n\n"+ e.getStackTrace());
                connection.rollback();
                return;
            } catch (SQLException ex) {
                throw new RuntimeException(ex);
            }

        }


        //aggiorno il carrello
        carrello.remove(IDFornitore);

        //aggiorno la sessione
        session.setAttribute("carrello", carrello);

        //mostro la nuova pagina degli ordini
        String path = getServletContext().getContextPath() + "/Ordini";
        response.sendRedirect(path);


    }

}
