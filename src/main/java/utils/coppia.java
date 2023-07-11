package utils;

import java.beans.Beans;
import java.util.List;

public class coppia {

    private Beans bean;
    private List list;

    public coppia(Beans bean, List list) {
        this.bean = bean;
        this.list = list;
    }

    public Beans getBean() {
        return bean;
    }

    public List getList() {
        return list;
    }
}
