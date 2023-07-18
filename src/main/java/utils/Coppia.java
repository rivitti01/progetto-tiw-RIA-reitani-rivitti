package utils;

import java.util.Map;

public class Coppia {

    private int codiceFornitore;
    private Map<Integer, CarrelloFornitore> carrello;

    public int getCodiceFornitore() {
        return codiceFornitore;
    }

    public void setCodiceFornitore(int codiceFornitore) {
        this.codiceFornitore = codiceFornitore;
    }

    public Map<Integer, CarrelloFornitore> getCarrello() {
        return carrello;
    }

    public void setCarrello(Map<Integer, CarrelloFornitore> carrello) {
        this.carrello = carrello;
    }
}
