package dao;

import beans.Prodotto;
import beans.Risultato;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

public class RisultatoDAO {

    private Connection con;
    public RisultatoDAO(Connection connection) {
        this.con = connection;
    }

    public List<Risultato> searchByWord (String word, int posizione) throws SQLException {
        List<Risultato> risultati = new ArrayList<>();
        String query = "SELECT vende.codice_prodotto,nome_prodotto, prezzo, sconto, foto, categoria, descrizione " +
                "FROM vende JOIN (SELECT * FROM prodotto WHERE nome_prodotto LIKE ? OR descrizione LIKE ?) as p " +
                "on vende.codice_prodotto = p.codice_prodotto " +
                "WHERE prezzo = (SELECT MIN(prezzo) FROM vende WHERE codice_prodotto = p.codice_prodotto) ORDER BY prezzo ASC limit 6 offset ? ";
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setString(1, "%" + word + "%");
            pstatement.setString(2, "%" + word + "%");
            pstatement.setInt(3, posizione);
            try (ResultSet result = pstatement.executeQuery();) {
                while (result.next()) {
                    Risultato risultato = new Risultato();
                    Prodotto prodotto = new Prodotto();
                    prodotto.setCodiceProdotto(result.getInt("codice_prodotto"));
                    prodotto.setNomeProdotto(result.getString("nome_prodotto"));
                    prodotto.setCategoria(result.getString("categoria"));
                    prodotto.setDescrizione(result.getString("descrizione"));
                    prodotto.setFoto(result.getBlob("foto"));
                    prodotto.setFotoBase64(Base64.getEncoder().encodeToString(result.getBlob("foto").getBytes(1, (int) result.getBlob("foto").length())));
                    risultato.setProdotto(prodotto);
                    risultato.setPrezzoMin(result.getInt("prezzo")*(1-result.getFloat("sconto")));
                    risultati.add(risultato);
                }
            }

        }
        return risultati;
    }

}
