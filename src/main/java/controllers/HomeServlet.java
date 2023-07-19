package controllers;

import beans.Prodotto;
import beans.Visualizza;
import com.google.gson.Gson;
import dao.ProdottoDAO;
import dao.VisualizzaDAO;
import org.thymeleaf.context.WebContext;
import utils.Constants;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.*;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
@WebServlet("/Home")
@MultipartConfig
public class HomeServlet extends ServletPadre {
    public HomeServlet() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Controlla se l'utente è già loggato, in caso positivo va direttamente alla home
        HttpSession session = request.getSession();

        String email = (String) session.getAttribute("email");
        List<Prodotto> products;
        try {
            products = getFiveProducts(email);
        } catch (SQLException e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Not possible to recover products");
            throw new RuntimeException(e);
        }
        for (Prodotto prodotto : products){
            try {
                prodotto.setFotoBase64(Base64.getEncoder().encodeToString(prodotto.getFoto().getBytes(1, (int) prodotto.getFoto().length())));
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        }

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        // mando la risposta
        response.getWriter().println(new Gson().toJson(products));



    }
    private List<Prodotto> getFiveProducts(String email) throws SQLException {
        VisualizzaDAO visualizzaDAO = new VisualizzaDAO(connection);
        ProdottoDAO prodottoDAO = new ProdottoDAO(connection);
        List<Visualizza> visualizza = null;
        List<Prodotto> prodotti;
        try {
            visualizza = visualizzaDAO.getLAstFive(email);
            prodotti = prodottoDAO.getFiveVisualizedProduct(visualizza);
            if (prodotti.size()< Constants.NUMBER_HOME_PRODUCT){
                prodotti = prodottoDAO.completeListVisualized(prodotti);
            }
            return prodotti;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

    }
}
