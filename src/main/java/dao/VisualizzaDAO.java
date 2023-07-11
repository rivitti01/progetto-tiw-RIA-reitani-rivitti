package dao;

import beans.Visualizza;
import utils.Constants;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class VisualizzaDAO {

    private Connection con;
    public VisualizzaDAO(Connection connection) {
        this.con = connection;
    }

    public List<Visualizza> getLAstFive (String email) throws SQLException{
        List<Visualizza> visualizzazioni = new ArrayList<>();

        String query = "SELECT * FROM visualizza WHERE email = ? ORDER BY data DESC LIMIT 5";
        try (PreparedStatement pstatement = con.prepareStatement(query)) {
            pstatement.setString(1, email);
            try (ResultSet result = pstatement.executeQuery();) {
                while (result.next()) {
                    Visualizza visualizza = mapRowToVisualizza(result);
                    visualizzazioni.add(visualizza);
                }
            }

        }
        return visualizzazioni;
    }

    public void addVisualized (String email, int codiceProdotto) throws SQLException{
        String query = "DELETE FROM visualizza where email = ? and codice_prodotto = ?";
        try (PreparedStatement pstatement = con.prepareStatement(query)) {
            pstatement.setString(1, email);
            pstatement.setInt(2, codiceProdotto);
            pstatement.executeUpdate();
        }
        query = "INSERT INTO visualizza (email, codice_prodotto) VALUES (?, ?)";
        try (PreparedStatement pstatement = con.prepareStatement(query)) {
            pstatement.setString(1, email);
            pstatement.setInt(2, codiceProdotto);
            pstatement.executeUpdate();
        }
    }


    private Visualizza mapRowToVisualizza(ResultSet result) throws SQLException {
        Visualizza visualizza = new Visualizza();
        visualizza.setEmail(result.getString("email"));
        visualizza.setCodiceProdotto(result.getInt("codice_prodotto"));
        return visualizza;
    }

}
