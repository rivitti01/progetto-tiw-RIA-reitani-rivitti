package beans;

import java.util.List;

public class OrdineConInformazioni {
    Ordine ordine;
    List<Informazioni> informazioni;


    public Ordine getOrdine() {
        return ordine;
    }

    public void setOrdine(Ordine ordine) {
        this.ordine = ordine;
    }

    public List<Informazioni> getInformazioni() {
        return informazioni;
    }

    public void setInformazioni(List<Informazioni> informazioni) {
        this.informazioni = informazioni;
    }

}
