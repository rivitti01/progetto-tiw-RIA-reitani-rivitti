package dao;

import beans.CarrelloFornitore;
import beans.Prodotto;
import java.sql.Connection;
import java.sql.SQLException;

public class CarrelloFornitoreDAO {

    private final CarrelloFornitore carrelloFornitore;

    public CarrelloFornitoreDAO(CarrelloFornitore carrelloFornitore) {
        this.carrelloFornitore = carrelloFornitore;
    }

    public void addProdotto(Prodotto prodotto, int quantita, Connection connection) throws SQLException {

        //verifico se il prodotto è già presente nel carrello, se lo è aggiorno la quantità, altrimenti lo aggiungo
        if (carrelloFornitore.getProdotti().containsKey(prodotto)) {
            int quantitaPrecedente = carrelloFornitore.getProdotti().get(prodotto);
            carrelloFornitore.getProdotti().put(prodotto, quantitaPrecedente + quantita);
        } else {
            carrelloFornitore.getProdotti().put(prodotto, quantita);
        }
        //aggiorno la quantità totale dei prodotti
        carrelloFornitore.setQuantitaTotaleProdotti(carrelloFornitore.getQuantitaTotaleProdotti() + quantita);

        //aggiorno il prezzo totale dei prodotti
        VendeDAO vendeDAO = new VendeDAO(connection);
        carrelloFornitore.setPrezzoTotaleProdotti(carrelloFornitore.getPrezzoTotaleProdotti() + vendeDAO.getPrice(prodotto.getCodiceProdotto(), carrelloFornitore.getFornitore().getCodiceFornitore()) * quantita);


        //aggiorno il prezzo della spedizione
        if (carrelloFornitore.getPrezzoTotaleProdotti() > carrelloFornitore.getFornitore().getSoglia()) {
            carrelloFornitore.setPrezzoSpedizione(0);
        } else {
            FasceDAO fasceDAO = new FasceDAO(connection);
            int spedizione = fasceDAO.getPrice(carrelloFornitore.getFornitore().getCodiceFornitore(), carrelloFornitore.getQuantitaTotaleProdotti());
            if (spedizione!=-1)
                carrelloFornitore.setPrezzoSpedizione(spedizione);
            else
                carrelloFornitore.setPrezzoSpedizione(carrelloFornitore.getFornitore().getSpedizioneMin());
        }

    }

}
