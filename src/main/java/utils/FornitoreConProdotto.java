package utils;

import beans.Fornitore;

public class FornitoreConProdotto {

    private float prezzoVendita;

    private Fornitore fornitore;

    public float getPrezzoVendita() {
        return prezzoVendita;
    }

    public void setPrezzoVendita(float prezzoVendita) {
        this.prezzoVendita = prezzoVendita;
    }

    public Fornitore getFornitore() {
        return fornitore;
    }

    public void setFornitore(Fornitore fornitore) {
        this.fornitore = fornitore;
    }
}
