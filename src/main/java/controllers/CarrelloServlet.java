package controllers;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;
import utils.CarrelloFornitore;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/Carrello")
public class CarrelloServlet extends ServletPadre{

    public void doPost (HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
        HttpSession session = request.getSession();
        int i =1;

        Map<Integer, CarrelloFornitore> carrello;

        // imposto la codifica per leggere i parametri, coerentemente all'HTML
        request.setCharacterEncoding("UTF-8");

        // leggo la stringa in input
        BufferedReader reader = request.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while( (line = reader.readLine()) != null )
            sb.append(line);
        String requestBody = sb.toString();

        // creo un oggetto gson
        Gson gson = new Gson();

        // prendo il token della classe da ritornare
        Type typeToken = new TypeToken<List<CarrelloFornitore>>(){}.getType();
        // e converto da JSON
        try {
            carrello = gson.fromJson(requestBody, typeToken);
        } catch (JsonSyntaxException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }


    }

}
