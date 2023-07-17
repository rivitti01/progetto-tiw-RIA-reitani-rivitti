package utils;

import beans.Fornitore;
import beans.Prodotto;

import java.util.HashMap;
import java.util.Map;

public class CarrelloFornitore {
    private final Fornitore fornitore;
    private int prezzoSpedizione = 0;
    private float prezzoTotaleProdotti = 0;
    private int quantitaTotaleProdotti = 0;
    private Map<Prodotto, Integer> prodotti = new HashMap<>();

    public CarrelloFornitore(Fornitore fornitore){
        this.fornitore = fornitore;
    }

    public Fornitore getFornitore() {
        return fornitore;
    }

    public int getPrezzoSpedizione() {
        return prezzoSpedizione;
    }

    public void setPrezzoSpedizione(int prezzoSpedizione) {
        this.prezzoSpedizione = prezzoSpedizione;
    }

    public float getPrezzoTotaleProdotti() {
        return prezzoTotaleProdotti;
    }

    public void setPrezzoTotaleProdotti(float prezzoTotaleProdotti) {
        this.prezzoTotaleProdotti = prezzoTotaleProdotti;
    }

    public int getQuantitaTotaleProdotti() {
        return quantitaTotaleProdotti;
    }

    public void setQuantitaTotaleProdotti(int quantitaTotaleProdotti) {
        this.quantitaTotaleProdotti = quantitaTotaleProdotti;
    }

    public Map<Prodotto, Integer> getProdotti() {
        return prodotti;
    }
}
