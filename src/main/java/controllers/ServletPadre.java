package controllers;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ServletContextTemplateResolver;
import utils.ConnectionHandler;

import java.sql.Connection;
import java.sql.SQLException;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

public abstract class ServletPadre extends HttpServlet {

    protected static final long serialVersionUID = 1L;
    protected Connection connection = null;

    public void init() throws ServletException {
        this.connection = ConnectionHandler.getConnection(this.getServletContext());
    }

    public void destroy() {
        try {
            ConnectionHandler.closeConnection(this.connection);
        } catch (SQLException var2) {
            var2.printStackTrace();
        }

    }
}
