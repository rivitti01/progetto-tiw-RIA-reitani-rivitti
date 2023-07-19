package controllers;

import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import dao.ProdottoDAO;
import dao.UtenteDAO;
import dao.VisualizzaDAO;

import java.sql.SQLException;

@WebServlet("/Visualizza")
@MultipartConfig
public class VisualizzaProdottoServlet extends ServletPadre {
    public VisualizzaProdottoServlet() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {

        HttpSession session = request.getSession();
        String email = (String) session.getAttribute("email");
        int codiceProdotto = Integer.parseInt(request.getParameter("codiceProdotto"));

        //controllo che i parametri non siano nulli o vuoti
        if (email == null || email.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }else {
            try {
                if (!checkEmail(email)) { // controllo se l'utente esiste
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            } catch (SQLException e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return;
            }
        }
        if (codiceProdotto < 0) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }else {
            try {
                if (!checkCodiceProdotto(codiceProdotto)) { //controllo se il prodotto esiste
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }
            } catch (SQLException e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return;
            }
        }


        VisualizzaDAO visualizzatoDAO = new VisualizzaDAO(connection);

        try {
            visualizzatoDAO.addVisualized(email, codiceProdotto);
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }



        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

    }

    private boolean checkEmail(String email) throws SQLException {
        UtenteDAO utenteDAO = new UtenteDAO(connection);
        if (utenteDAO.getUtenteByEmail(email) != null){
            return true;
        } else {
            return false;
        }
    }
    private boolean checkCodiceProdotto(int codiceProdotto) throws SQLException {
        ProdottoDAO prodottoDAO = new ProdottoDAO(connection);
        if (prodottoDAO.getProdottoByCodiceProdotto(codiceProdotto) != null){
            return true;
        } else {
            return false;
        }
    }

}
