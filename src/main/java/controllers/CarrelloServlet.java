package controllers;

import beans.CarrelloFornitore;
import org.thymeleaf.context.WebContext;

import java.io.IOException;
import java.util.HashMap;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/Carrello")

public class CarrelloServlet extends ServletPadre{

    public CarrelloServlet() {
        super();
    }


    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        WebContext ctx = new WebContext(request, response, getServletContext(), request.getLocale());

        //prendo il carrello dalla sessione e lo metto nel contesto
        HashMap<Integer, CarrelloFornitore> carrello = (HashMap<Integer, CarrelloFornitore>) session.getAttribute("carrello");
        ctx.setVariable("carrello", carrello);

        templateEngine.process("WEB-INF/carrello.html", ctx, response.getWriter());
    }


}
