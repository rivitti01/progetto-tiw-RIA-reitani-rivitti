package beans;

public class Fornitore {
    private int codiceFornitore;
    private String nomeFornitore;
    private int valutazione;
    private int soglia;
    private int spedizioneMin;

    public int getCodiceFornitore() {
        return codiceFornitore;
    }

    public void setCodiceFornitore(int codiceFornitore) {
        this.codiceFornitore = codiceFornitore;
    }

    public String getNomeFornitore() {
        return nomeFornitore;
    }

    public void setNomeFornitore(String nome_fornitore) {
        this.nomeFornitore = nome_fornitore;
    }

    public int getValutazione() {
        return valutazione;
    }

    public void setValutazione(int valutazione) {
        this.valutazione = valutazione;
    }

    public int getSoglia() {
        return soglia;
    }

    public void setSoglia(int soglia) {
        this.soglia = soglia;
    }

    public int getSpedizioneMin() {
        return spedizioneMin;
    }
    public void setSpedizioneMin(int spedizioneMin) {
        this.spedizioneMin = spedizioneMin;
    }
}
