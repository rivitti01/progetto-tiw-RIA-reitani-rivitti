package controllers;

import javax.servlet.annotation.WebServlet;

import beans.CarrelloFornitore;
import beans.Fasce;
import beans.Fornitore;
import beans.Prodotto;
import dao.*;
import org.thymeleaf.context.WebContext;
import utils.Risultato;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/Ricerca")
public class RicercaServlet extends ServletPadre {
    public RicercaServlet() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        //controllo che i codici dei prodotti espansi siano validi
        String[] scodiciDaEspandere = request.getParameterValues("codiceProdottoEspanso");
        List<Integer> codiciDaEspndere = new ArrayList<>();
        if(scodiciDaEspandere != null) {
            for (String c : scodiciDaEspandere) {
                int cod;
                try {
                    cod = Integer.parseInt(c);
                } catch (NumberFormatException ex) {
                    response.sendError(HttpServletResponse.SC_BAD_REQUEST, "il codice prodotto non è un numero");
                    return;
                }

                if (cod <= 0) {
                    response.sendError(HttpServletResponse.SC_BAD_REQUEST, "il codice prodotto non è un numero valido");

                    return;
                }
                codiciDaEspndere.add(cod);
            }
        }


        WebContext ctx = new WebContext(request, response, getServletContext(), request.getLocale());

        String word = request.getParameter("word");

        //Verifica che word sia presente
        if (word == null || word.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("il campo di ricerca è vuoto");
            return;
        }

        //verifico che la posizione di partenza sia un numero
        int posizione;
        try{
            posizione = Integer.parseInt(request.getParameter("posizione"));
        }catch (NumberFormatException ex){
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "la posizione di partenza non è un numero");
            return;
        }

        //verifico che la posizione di partenza sia un numero positivo
        if(posizione < 0){
            posizione = 0;
        }

        //ricerca i prodotti per parola
        RisultatoDAO risultatoDAO = new RisultatoDAO(connection);
        List<Risultato> risultati;
        try {
            risultati = risultatoDAO.searchByWord(word, posizione);
        } catch (SQLException e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Query ricerca fallita");
            return;
        }

        //verifica che i codici prodotto da espandere siano effettivamente presenti nella ricerca
        for(Integer codice : codiciDaEspndere){
            if(risultati.stream().filter(r -> r.getCodiceProdotto() == codice).count() == 0) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "il codice prodotto non è valido");
                return;
            }
        }

        //verifico che non sia l'ultima pagina da caricare
        boolean isLastPage;
        if(risultati.size() == 6){
            isLastPage = false;
            risultati.remove(5);
        }else {
            isLastPage = true;
        }
        ctx.setVariable("isLastPage", isLastPage);

        //setta gli attributi per la visualizzazione dei risultati
        for(Risultato r : risultati){
            if(codiciDaEspndere.contains(r.getCodiceProdotto())){
                r.setEspandere(true);
            }
        }

        //crea le mappe per la visualizzazione dei risultati
        ProdottoDAO prodottoDAO = new ProdottoDAO(connection);
        FasceDAO fasceDAO = new FasceDAO(connection);
        VendeDAO vendeDAO = new VendeDAO(connection);
        FornitoreDAO fornitoreDAO = new FornitoreDAO(connection);

        HashMap<Prodotto, List<Fornitore>> fornitoreMap = new HashMap<>();
        HashMap < Fornitore, List<Fasce>> fasceMap = new HashMap<>();
        HashMap < Risultato, Prodotto> prodottoMap = new HashMap<>();
        HashMap < Fornitore, HashMap > prezzoUnitarioMap = new HashMap<>();
        HashMap <Integer, String> fotoMap = new HashMap<>();
        for(Risultato r : risultati){
            if (r.isEspandere()){
                try {
                    Prodotto p = prodottoDAO.getInformation(r.getCodiceProdotto());
                    fotoMap.put(p.getCodiceProdotto(), Base64.getEncoder().encodeToString(p.getFoto().getBytes(1, (int) p.getFoto().length())));
                    List<Fornitore> fornitori = vendeDAO.getFornitori(p.getCodiceProdotto());
                    for (Fornitore f : fornitori){
                        HashMap<Risultato, Float> ausiliariaMap = new HashMap<>();
                        List<Fasce> fasce = fasceDAO.getFasce(f.getCodiceFornitore());
                        fasceMap.put(f, fasce);

                        float prezzoUnitario = vendeDAO.getPrice(r.getCodiceProdotto(), f.getCodiceFornitore());
                        ausiliariaMap.put(r, prezzoUnitario);
                        prezzoUnitarioMap.put(f , ausiliariaMap);
                    }

                    prodottoMap.put(r, p);
                    fornitoreMap.put(p, fornitori);
                } catch (SQLException e) {
                    response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
                    return;
                }
            }
        }
        ctx.setVariable("fotoMap", fotoMap);
        ctx.setVariable("fornitoreMap", fornitoreMap);
        ctx.setVariable("fasceMap", fasceMap);
        ctx.setVariable("prodottoMap", prodottoMap);
        ctx.setVariable("prezzoUnitarioMap", prezzoUnitarioMap);
        ctx.setVariable("risultati", risultati);
        ctx.setVariable("word", word);
        ctx.setVariable("posizione", posizione);
        HttpSession session = request.getSession();
        //Verifico che già esista un carrello nella sessione. Se non esiste lo creo
        HashMap<Integer, CarrelloFornitore> carrello = (HashMap<Integer, CarrelloFornitore>) session.getAttribute("carrello");
        if (carrello == null) {
            carrello = new HashMap<Integer, CarrelloFornitore>();
        }
        ctx.setVariable("carrello", carrello);


        templateEngine.process("WEB-INF/risultati.html", ctx, response.getWriter());

    }


}
