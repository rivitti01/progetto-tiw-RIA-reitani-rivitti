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

@WebFilter( urlPatterns = {"/Login"})
public class NotLoginFilter implements Filter{

    //checks that the session is not active; in case it is active, redirect to the Home page
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        String homePath = req.getServletContext().getContextPath() + "/home.html";

        HttpSession session = req.getSession();
        if (!session.isNew() && session.getAttribute("email") != null) {
            ((HttpServletResponse)response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);

            return;
        } else {
            chain.doFilter(request, response);
        }
    }
}
