package controllers;

import beans.Informazioni;
import beans.Ordine;
import beans.Prodotto;
import dao.OrdineDAO;
import org.thymeleaf.context.WebContext;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@WebServlet("/Ordini")
public class OrdiniServlet extends ServletPadre {
    public OrdiniServlet() {
        super();
    }


    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        WebContext ctx = new WebContext(request, response, getServletContext(), request.getLocale());
        String email = (String) session.getAttribute("email");
        Map<Ordine,List<Informazioni>> ordini;
        try {
            ordini = getOrdini(email);
            if (ordini == null) {
                ctx.setVariable("error", "No orders found");
                return;
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        ctx.setVariable("ordini", ordini);
        try {
            templateEngine.process("WEB-INF/ordini.html", ctx, response.getWriter());
        }catch (Exception ex){
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, ex.getMessage());
        }

    }

    private Map<Ordine,List<Informazioni>> getOrdini(String email) throws SQLException {
        OrdineDAO ordineDAO = new OrdineDAO(connection);
        Map<Ordine,List<Informazioni>> ordini2 = ordineDAO.getOrdersByEmail(email);
        return ordini2;
    }


}
