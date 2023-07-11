package controllers;

import dao.*;
import utils.Risultato;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
@WebServlet("/Espandi")
public class EspandiServlet extends ServletPadre{
    public EspandiServlet() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        //controlla che ci sia la parola
        String word = request.getParameter("word");
        if(word == null || word.isEmpty()){
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("il campo di ricerca è vuoto");
            return;
        }

        //controlla che ci sia il codice del prodotto da espandere
        String scodiceProdottoDaEspandere = request.getParameter("codiceProdotto");
        if(scodiceProdottoDaEspandere == null || scodiceProdottoDaEspandere.isEmpty()){
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("il codice prodotto non può essere vuoto");
            return;
        }

        //controlla che il codice del prodotto da espandere sia un numero
        Integer codiceProdottoDaEspandere;
        try{
            codiceProdottoDaEspandere = Integer.parseInt(scodiceProdottoDaEspandere);
        }catch (NumberFormatException ex){
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("il codice prodotto non è un numero");
            return;
        }

        String[] scodiciProdottiGiaEspansi = request.getParameterValues("codiceProdottoEspanso");
        if(scodiciProdottiGiaEspansi == null){
            scodiciProdottiGiaEspansi = new String[0];
        }

        //controlla che i codici dei prodotti gia espansi siano numeri
        List<Integer> codiciProdottiGiaEspansi = new ArrayList<>();
        for(String scodice : scodiciProdottiGiaEspansi){
            try{
                codiciProdottiGiaEspansi.add(Integer.parseInt(scodice));
            }catch (NumberFormatException ex){
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().println("il codice prodotto non è un numero");
                return;
            }
        }

        RisultatoDAO risultatoDAO = new RisultatoDAO(connection);
        List<Risultato> risultati;

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

        //prende i risultati dalla parola
        try{
            risultati = risultatoDAO.searchByWord(word, posizione);
        }catch(SQLException ex){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Errore nel caricamento dei risultati");
            return;
        }

        //controlla che il codice del prodotto da espandere sia attinente alla ricerca
        if(risultati.stream().filter(x -> x.getCodiceProdotto() == codiceProdottoDaEspandere).count() == 0){
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Codice prodotto da espandere non attinente la ricerca");
            return;
        }
        for(Integer i : codiciProdottiGiaEspansi){
            if(risultati.stream().filter(x -> x.getCodiceProdotto() == i).count() == 0){
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().println("Codice prodotto non attinente la ricerca");
                return;
            }
        }

        //modificare il valore espandere nei risultati da espandere
        for(Risultato r : risultati){
            boolean espandere = (
                    codiciProdottiGiaEspansi.contains(r.getCodiceProdotto()) &&
                    r.getCodiceProdotto() != (codiceProdottoDaEspandere))

                    || (r.getCodiceProdotto() == (codiceProdottoDaEspandere) &&
                            !codiciProdottiGiaEspansi.contains(r.getCodiceProdotto()));
            r.setEspandere(espandere);
        }

        //se visualizzo un nuovo prodotto lo aggiungo alla tabella visualizza
        if(!codiciProdottiGiaEspansi.contains(codiceProdottoDaEspandere)) {
            VisualizzaDAO visualizzatoDAO = new VisualizzaDAO(connection);
            HttpSession session = request.getSession();
            String email = (String) session.getAttribute("email");
            try {
                visualizzatoDAO.addVisualized(email, codiceProdottoDaEspandere);

            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        }


            //creo il path per mandare alla servlet Ricerca tutti i dati
        String path = getServletContext().getContextPath() + "/Ricerca?word=" + word + "&posizione=" + posizione;
        for(int i = 0;i<risultati.size();i++){
            if(risultati.get(i).isEspandere()){
                path += "&codiceProdottoEspanso=" + risultati.get(i).getCodiceProdotto();
            }
        }

        response.sendRedirect(path);

    }

}
