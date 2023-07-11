package beans;

public class Vende {

    private int codiceFornitore;
    private int codiceProdotto;
    private float sconto;
    private int prezzo;

    public int getCodiceFornitore() {
        return codiceFornitore;
    }

    public void setCodiceFornitore(int codiceFornitore) {
        this.codiceFornitore = codiceFornitore;
    }

    public int getCodiceProdotto() {
        return codiceProdotto;
    }

    public void setCodiceProdotto(int codiceProdotto) {
        this.codiceProdotto = codiceProdotto;
    }

    public float getSconto() {
        return sconto;
    }

    public void setSconto(float sconto) {
        this.sconto = sconto;
    }

    public int getPrezzo() {
        return prezzo;
    }

    public void setPrezzo(int prezzo) {
        this.prezzo = prezzo;
    }
}
