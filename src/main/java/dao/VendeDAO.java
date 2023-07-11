package dao;

import beans.Fornitore;
import beans.Prodotto;
import beans.Vende;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class VendeDAO {
    private Connection con;
    public VendeDAO(Connection connection) {
        this.con = connection;
    }

    /*public Vende getMinPrice(int codiceProdotto) throws SQLException{
        String query = "SELECT * FROM vende WHERE codice_prodotto = ? ORDER BY prezzo ASC LIMIT 1";
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setInt(1, codiceProdotto);
            try (ResultSet result = pstatement.executeQuery();) {
                if (!result.isBeforeFirst()) // no results, credential check failed
                    return null;
                else {
                    result.next();
                    return mapRowToVende(result);
                }
            }
        }
    }*/

    public Integer getMinPrice(int codiceProdotto) throws SQLException{
        String query = "SELECT * FROM vende WHERE codice_prodotto = ? ORDER BY prezzo ASC LIMIT 1";
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setInt(1, codiceProdotto);
            try (ResultSet result = pstatement.executeQuery();) {
                if (!result.isBeforeFirst()) // no results, credential check failed
                    return null;
                else {
                    result.next();
                    return result.getInt("prezzo");
                }
            }
        }
    }

    public List<Vende> getNDiscountedProducts(int n) throws SQLException{
        List<Vende> prodotti = new ArrayList<Vende>();
        String query = "SELECT codice_prodotto, codice_forniotre, prezzo, sconto FROM vende v JOIN prodotto p ON p.codice_prodotto = v.codice_prodotto WHERE categoria = 'Informatica' AND sconto > 0 ORDER BY RAND() LIMIT ?";
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setInt(1, n);
            try (ResultSet result = pstatement.executeQuery();) {
                while (result.next()) {
                    Vende prodotto = mapRowToVende(result);
                    prodotti.add(prodotto);
                }
            }

        }
        return prodotti;
    }

    public List<Fornitore> getFornitori(int codiceProdotto) throws SQLException{
        String query = "SELECT f.codice_fornitore, f.nome_fornitore, f.valutazione, f.soglia, f.spedizione_min FROM fornitore as f, vende as v where f.codice_fornitore = v.codice_fornitore and v.codice_prodotto = ?";
        List<Fornitore> fornitori = new ArrayList<>();
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setInt(1, codiceProdotto);
            try (ResultSet result = pstatement.executeQuery();) {
                while (result.next()) {
                    Fornitore fornitore = new Fornitore();
                    fornitore.setCodiceFornitore(result.getInt("codice_fornitore"));
                    fornitore.setNomeFornitore(result.getString("nome_fornitore"));
                    fornitore.setSoglia(result.getInt("soglia"));
                    fornitore.setValutazione(result.getInt("valutazione"));
                    fornitore.setSpedizioneMin(result.getInt("spedizione_min"));
                    fornitori.add(fornitore);
                }
            }
        }
        return fornitori;
    }

    public float getPrice(int codiceProdotto, int codiceFornitore) throws SQLException{
        String query = "SELECT prezzo, sconto FROM vende WHERE codice_prodotto = ? AND codice_fornitore = ?";
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setInt(1, codiceProdotto);
            pstatement.setInt(2, codiceFornitore);
            try (ResultSet result = pstatement.executeQuery();) {
                if (!result.isBeforeFirst()) // no results, credential check failed
                    return -1;
                else {
                    result.next();
                    return result.getInt("prezzo")*(1-(float)result.getFloat("sconto"));
                }
            }
        }
    }

    private Vende mapRowToVende(ResultSet result) throws SQLException {
        Vende vende = new Vende();
        vende.setCodiceProdotto(result.getInt("codice_prodotto"));
        vende.setCodiceFornitore(result.getInt("codice_fronitore"));
        vende.setPrezzo(result.getInt("prezzo"));
        vende.setSconto(result.getFloat("sconto"));
        return vende;
    }
}
