package com.backend.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Set;

@Entity
@Table(name = "Date")
public class Date implements Serializable {
    @Id
    @Column(name = "date")
    private java.sql.Date date;

    @OneToOne(mappedBy = "dateRef")
    private Holiday holiday;

    @OneToMany(mappedBy = "date_ProductDateDiscount")
    private Set<ProductDateDiscount> productDateDiscounts;

    @OneToMany(mappedBy = "date_StoreProductSale")
    private Set<StoreProductSale> storeProductSales;


    public java.sql.Date getDate() {
        return date;
    }

    public void setDate(java.sql.Date date) {
        this.date = date;
    }

    public Holiday getHoliday() {
        return holiday;
    }

    public void setHoliday(Holiday holiday) {
        this.holiday = holiday;
    }

    public Set<ProductDateDiscount> getProductDateDiscounts() {
        return productDateDiscounts;
    }

    public void setProductDateDiscounts(Set<ProductDateDiscount> productDateDiscounts) {
        this.productDateDiscounts = productDateDiscounts;
    }

    public Set<StoreProductSale> getStoreProductSales() {
        return storeProductSales;
    }

    public void setStoreProductSales(Set<StoreProductSale> storeProductSales) {
        this.storeProductSales = storeProductSales;
    }
}
