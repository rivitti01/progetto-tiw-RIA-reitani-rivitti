package beans;

import java.util.ArrayList;
import java.util.List;

public class Risultato {

    private Prodotto prodotto;
    private float prezzoMin;
    private boolean espandere = false;
    private List<FornitoreConProdotto> fornitori = new ArrayList<FornitoreConProdotto>();


    public boolean isEspandere() {
        return espandere;
    }
    public Risultato(){}
    public void setEspandere(boolean espandere) {
        this.espandere = espandere;
    }

    public float getPrezzoMin() {
        return prezzoMin;
    }

    public void setPrezzoMin(float prezzoMin) {
        this.prezzoMin = prezzoMin;
    }

    public Prodotto getProdotto() {
        return prodotto;
    }

    public void setProdotto(Prodotto prodotto) {
        this.prodotto = prodotto;
    }

    public List<FornitoreConProdotto> getFornitori() {
        return fornitori;
    }

    public void setFornitori(List<FornitoreConProdotto> fornitori) {
        this.fornitori = fornitori;
    }
}
