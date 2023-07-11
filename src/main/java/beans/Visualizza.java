package beans;

import java.sql.Timestamp;

public class Visualizza {

    private String email;
    private int codiceProdotto;

    private Timestamp data;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getCodiceProdotto() {
        return codiceProdotto;
    }

    public void setCodiceProdotto(int codiceProdotto) {
        this.codiceProdotto = codiceProdotto;
    }

    public Timestamp getData() {
        return data;
    }

    public void setData(Timestamp data) {
        this.data = data;
    }
}
