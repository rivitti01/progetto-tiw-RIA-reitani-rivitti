package dao;

import beans.Informazioni;
import beans.Ordine;
import beans.Prodotto;

import javax.swing.*;
import java.sql.*;
import java.util.*;

public class InformazioniDAO {

    private Connection con;
    public InformazioniDAO(Connection connection) {
        this.con = connection;
    }

    public void inserisciInformazioni(Informazioni informazione) throws SQLException {
        String query = "INSERT INTO informazioni (codice_ordine, codice_prodotto, nome, quantita, prezzo_unitario) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement pstatement = con.prepareStatement(query)) {
            pstatement.setInt(1, informazione.getCodiceOrdine());
            pstatement.setInt(2, informazione.getCodiceProdotto());
            pstatement.setString(3, informazione.getNome());
            pstatement.setInt(4, informazione.getQuantità());
            pstatement.setFloat(5, informazione.getPrezzoUnitario());
            pstatement.executeUpdate();

        }
    }

}
