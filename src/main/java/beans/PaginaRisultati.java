package beans;

import java.util.ArrayList;
import java.util.List;

public class PaginaRisultati {

    private List<Risultato> risultati = new ArrayList<Risultato>();
    boolean ultimaPagina = false;

    public List<Risultato> getRisultati() {
        return risultati;
    }

    public void setRisultati(List<Risultato> risultati) {
        this.risultati = risultati;
    }

    public boolean isUltimaPagina() {
        return ultimaPagina;
    }

    public void setUltimaPagina(boolean ultimaPagina) {
        this.ultimaPagina = ultimaPagina;
    }
}
