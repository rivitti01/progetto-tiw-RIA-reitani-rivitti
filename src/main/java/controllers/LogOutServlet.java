package controllers;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/Logout")
@MultipartConfig
public class LogOutServlet extends ServletPadre{
    public LogOutServlet() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        //invalidate the session
        HttpSession session = request.getSession(false);
        session.invalidate();

        //redirect the user to the index page
        String path = this.getServletContext().getContextPath() + "/index.html";
        response.sendRedirect(path);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.doGet(request, response);
    }
}
//adattata dal progetto di fraternali