package controllers;

import beans.Utente;
import dao.UtenteDAO;
import org.thymeleaf.context.WebContext;

import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import com.google.gson.Gson;
@WebServlet("/Login")
public class LoginServlet extends ServletPadre {

    public LoginServlet() {
        super();
    }



    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        String error;
        WebContext ctx = new WebContext(request, response, getServletContext(), request.getLocale());

        if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
            error = "Email e password sono obbligatorie";
            ctx.setVariable("error", error);
            templateEngine.process("/index.html", ctx, response.getWriter());
            return;
        }

        // Verifica le credenziali nel database
        boolean checkLogin;
        try {
            checkLogin = checkCredentials(email, password);
        } catch (SQLException e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failure in database credential verification");
            throw new RuntimeException(e);
        }

        if (checkLogin) {
            // Mostra la pagina di benvenuto
            HttpSession session = request.getSession();
            session.setAttribute("email", email);

            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            // mando la risposta
            response.getWriter().println(new Gson().toJson(email));

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
