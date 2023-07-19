package controllers;

import beans.Utente;
import dao.UtenteDAO;
import org.apache.commons.lang.StringEscapeUtils;

import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import com.google.gson.Gson;
@WebServlet("/Login")
@MultipartConfig
public class LoginServlet extends ServletPadre {

    public LoginServlet() {
        super();
    }



    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String email = StringEscapeUtils.escapeJava(request.getParameter("email"));
        String password = StringEscapeUtils.escapeJava(request.getParameter("password"));
        String error;

        // Controlla che i parametri siano corretti
        if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
            error = "Email e password sono obbligatorie";
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, error);
            return;
        }

        // Verifica le credenziali nel database
        boolean checkLogin;
        try {
            checkLogin = checkCredentials(email, password);
        } catch (SQLException e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failure in database credential verification");
            return;
        }

        if (checkLogin) {
            // Mostra la pagina di benvenuto
            HttpSession session = request.getSession();
            while(session.getAttributeNames().hasMoreElements()){
                session.removeAttribute(session.getAttributeNames().nextElement());
            }

            session.setAttribute("email", email);

            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            // mando la risposta
            response.getWriter().println(email);

        } else {
            // Mostra un messaggio di errore
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Incorrect credentials");
        }
    }

    private boolean checkCredentials(String email, String password) throws SQLException {
        UtenteDAO checkCredentials = new UtenteDAO(connection);
        Utente utente = checkCredentials.checkCredentials(email, password);
        // Effettua la verifica delle credenziali nel database
         if(utente != null){
             return true;
         }
         else{
             return false;
         }
    }


}
