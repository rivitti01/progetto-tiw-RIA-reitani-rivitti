package utils;

import beans.Fornitore;
import beans.Prodotto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CarrelloFornitore {

    private int codiceFornitore;

    private String nomeFornitore;
    private int prezzoSpedizione = 0;
    private float prezzoTotaleProdotti = 0;
    private int quantitaTotaleProdotti = 0;

    private List<ProdottoCarrello> prodottiCarrello = new ArrayList<>();

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

    public int getCodiceFornitore() {
        return codiceFornitore;
    }

    public void setCodiceFornitore(int codiceFornitore) {
        this.codiceFornitore = codiceFornitore;
    }

    public String getNomeFornitore() {
        return nomeFornitore;
    }

    public void setNomeFornitore(String nomeFornitore) {
        this.nomeFornitore = nomeFornitore;
    }

    public List<ProdottoCarrello> getProdottiCarrello() {
        return prodottiCarrello;
    }

    public void setProdottiCarrello(List<ProdottoCarrello> prodottiCarrello) {
        this.prodottiCarrello = prodottiCarrello;
    }
}
