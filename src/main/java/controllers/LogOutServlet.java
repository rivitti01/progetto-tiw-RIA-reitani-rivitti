package controllers;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/Logout")
public class LogOutServlet extends ServletPadre{
    public LogOutServlet() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        //invalidate the session
        HttpSession session = request.getSession();
        session.invalidate();

        //redirect the user to the index page
        String path = getServletContext().getContextPath() + "/index.html";
        response.sendRedirect(path);
    }
}
