package dao;

import beans.Informazioni;
import beans.Ordine;
import beans.Prodotto;

import javax.swing.*;
import java.sql.*;
import java.util.*;

public class OrdineDAO {

    private Connection con;
    public OrdineDAO(Connection connection) {
        this.con = connection;
    }

    public Map<Ordine,List<Informazioni>> getOrdersByEmail(String email) throws SQLException{
        Map<Ordine,List<Informazioni>> prodottiPerOdine = new LinkedHashMap<>();
        List<Ordine> ordini = new ArrayList<>();
        String query = "SELECT * FROM ordini WHERE email = ? ORDER BY codice_ordine DESC";
        try (PreparedStatement pstatement = con.prepareStatement(query)) {
            pstatement.setString(1, email);
            try (ResultSet result = pstatement.executeQuery();) {
                while (result.next()) {
                    Ordine ordine = mapRowToOrdine(result);
                    ordini.add(ordine);
                }
            }

        }
        String query2 = "SELECT codice_prodotto, nome, quantita FROM informazioni WHERE codice_ordine = ?";

        for (Ordine ordine : ordini) {
            List<Informazioni> informazioni = new ArrayList<>();
            try (PreparedStatement pstatement = con.prepareStatement(query2)) {
                pstatement.setInt(1, ordine.getCodiceOrdine());
                try (ResultSet result = pstatement.executeQuery();) {
                    while (result.next()) {
                        Informazioni informazione = mapRowToInformazione(result);
                        informazioni.add(informazione);
                    }
                    prodottiPerOdine.put(ordine, informazioni);
                }
            }
        }
        return prodottiPerOdine;
    }

    public void createOrder(Ordine ordine) throws SQLException {
        String query = "INSERT INTO ordini (nome_fornitore, data_spedizione, prezzo_totale, email, indirizzo_spedizione) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement pstatement = con.prepareStatement(query)) {
            pstatement.setString(1, ordine.getNomeFornitore());
            pstatement.setDate(2, ordine.getDataSpedizione());
            pstatement.setFloat(3, ordine.getPrezzoTotale());
            pstatement.setString(4, ordine.getEmail());
            pstatement.setString(5, ordine.getIndirizzoSpedizione());
            pstatement.executeUpdate();
        }

    }

    public int getCodiceUltimoOrdine(String email) throws SQLException{
        String query = "SELECT codice_ordine FROM ordini WHERE email = ? ORDER BY codice_ordine DESC LIMIT 1";
        try (PreparedStatement pstatement = con.prepareStatement(query)) {
            pstatement.setString(1, email);
            try (ResultSet result = pstatement.executeQuery();) {
                if (!result.isBeforeFirst()) // no results, credential check failed
                    return -1;
                else {result.next();
                    return result.getInt("codice_ordine");
                }
            }
        }

    }


    private Ordine mapRowToOrdine(ResultSet result) throws SQLException {
        Ordine ordine = new Ordine();
        ordine.setCodiceOrdine(result.getInt("codice_ordine"));
        ordine.setEmail(result.getString("email"));
        ordine.setDataSpedizione(result.getDate("data_spedizione"));
        ordine.setNomeFornitore(result.getString("nome_fornitore"));
        ordine.setPrezzoTotale(result.getInt("prezzo_totale"));
        ordine.setIndirizzoSpedizione(result.getString("indirizzo_spedizione"));
        return ordine;
    }
    private Informazioni mapRowToInformazione(ResultSet result) throws SQLException {
        Informazioni informazione = new Informazioni();
        informazione.setCodiceProdotto(result.getInt("codice_prodotto"));
        informazione.setNome(result.getString("nome"));
        informazione.setQuantità(result.getInt("quantita"));
        return informazione;
    }

}
