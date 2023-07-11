package filters;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpSession;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebFilter( urlPatterns = {"/Home", "/Ordini", "/Ricerca", "/Ricarica", "/Espandi", "/Carrello", "/AggiungiAlCarrello", "/Logout"})
public class LogInFilter implements Filter{
    //checks that the session is active; in case it is not so, redirect to the sign-in page
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        String signInPath = req.getServletContext().getContextPath() + "/index.html";

        HttpSession s = req.getSession();
        if (s.isNew() || s.getAttribute("email") == null) {
            res.sendRedirect(signInPath);
            return;
        }
        chain.doFilter(request, response);
    }

}
