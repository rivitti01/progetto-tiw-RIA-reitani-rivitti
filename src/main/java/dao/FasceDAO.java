package dao;

import beans.Fasce;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class FasceDAO {

    private Connection con;
    public FasceDAO(Connection connection) {
        this.con = connection;
    }

   public int getPrice(int codiceFornitore, int quantità)throws SQLException{
        String query = "SELECT prezzo FROM fasce WHERE codice_fornitore = ? AND min <= ? AND max >= ?";
        try (PreparedStatement pstatement = con.prepareStatement(query)) {
            pstatement.setInt(1, codiceFornitore);
            pstatement.setInt(2, quantità);
            pstatement.setInt(3, quantità);
            try (ResultSet result = pstatement.executeQuery();) {
                if (!result.isBeforeFirst()) // no results, credential check failed
                    return -1;
                else {
                    result.next();
                    return result.getInt("prezzo");
                }
            }
        }
    }

    public List<Fasce> getFasce (int codiceFornitore) throws SQLException{
        List<Fasce> fasce = new ArrayList<Fasce>();
        String query = "SELECT * FROM fasce WHERE codice_fornitore = ?";
        try (PreparedStatement pstatement = con.prepareStatement(query)) {
            pstatement.setInt(1, codiceFornitore);
            try (ResultSet result = pstatement.executeQuery();) {
                while (result.next()) {
                    Fasce fascia = new Fasce();
                    fascia.setCodiceFornitore(result.getInt("codice_fornitore"));
                    fascia.setMin(result.getInt("min"));
                    fascia.setMax(result.getInt("max"));
                    fascia.setPrezzo(result.getInt("prezzo"));
                    fasce.add(fascia);
                }
            }
        }
        return fasce;
    }
}
