package controllers;

import utils.OrdineConInformazioni;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import dao.OrdineDAO;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

@WebServlet("/Ordini")
public class OrdiniServlet extends ServletPadre {
    public OrdiniServlet() {
        super();
    }


    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        String email = (String) session.getAttribute("email");
        List<OrdineConInformazioni> ordini;
        try {
            ordini = getOrdini(email);
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        // creo un oggetto gson
        Gson gson = new GsonBuilder().setDateFormat("dd/MM/yyyy").create();
        // scrivo la stringa in json
        String json = gson.toJson(ordini);
        // ritorno il risultato
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(json);

    }

    private List<OrdineConInformazioni> getOrdini(String email) throws SQLException {
        OrdineDAO ordineDAO = new OrdineDAO(connection);
        List<OrdineConInformazioni> ordini2 = ordineDAO.getOrdersByEmail(email);
        return ordini2;
    }


}
