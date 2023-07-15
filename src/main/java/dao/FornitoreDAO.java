package dao;

import beans.Fornitore;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class FornitoreDAO {

    private Connection con;
    public FornitoreDAO(Connection connection) {
        this.con = connection;
    }

    public Fornitore getFornitore(int codiceFornitore) throws SQLException {
        String query = "SELECT * FROM fornitore WHERE codice_fornitore = ?";
        try (PreparedStatement pstatement = con.prepareStatement(query)) {
            pstatement.setInt(1, codiceFornitore);
            try (ResultSet result = pstatement.executeQuery();) {
                if (!result.isBeforeFirst()) // no results, credential check failed
                    return null;
                else {
                    result.next();
                    Fornitore fornitore = new Fornitore();
                    fornitore.setCodiceFornitore(result.getInt("codice_fornitore"));
                    fornitore.setNomeFornitore(result.getString("nome_fornitore"));
                    fornitore.setSoglia(result.getInt("soglia"));
                    fornitore.setValutazione(result.getInt("valutazione"));
                    fornitore.setSpedizioneMin(result.getInt("spedizione_min"));
                    return fornitore;
                }
            }
        }
    }

    public List<Fornitore> getListaFornitori(int codicePordotto){
        List<Fornitore> fornitori = new ArrayList<>();
        String query = "SELECT * FROM fornitore WHERE codice_fornitore IN (SELECT codice_fornitore FROM vende WHERE codice_prodotto = ?)";
        try (PreparedStatement pstatement = con.prepareStatement(query)) {
            pstatement.setInt(1, codicePordotto);
            try (ResultSet result = pstatement.executeQuery();) {
                if (!result.isBeforeFirst()) // no results, credential check failed
                    return null;
                else {
                    while (result.next()){
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
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return fornitori;
    }


}
