package com.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Store_Product_Sale")
@IdClass(StoreProductSaleId.class)
public class StoreProductSale {
    @Id
    @Column(name = "storeNumber", length = 12, nullable = false)
    private String storeNumber;

    @Id
    @Column(name = "PID", length = 12, nullable = false)
    private String PID;

    @Id
    @Column(name = "date", nullable = false)
    private java.sql.Date date;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @ManyToOne
    @JoinColumn(name = "storeNumber", referencedColumnName = "storeNumber", insertable = false, updatable = false)
    private Store store_StoreProductSale;

    @ManyToOne
    @JoinColumn(name = "PID", referencedColumnName = "PID", insertable = false, updatable = false)
    private Product product_StoreProductSale;

    @ManyToOne
    @JoinColumn(name = "date", referencedColumnName = "date", insertable = false, updatable = false)
    private com.backend.entity.Date date_StoreProductSale;

    public String getStoreNumber() {
        return storeNumber;
    }

    public void setStoreNumber(String storeNumber) {
        this.storeNumber = storeNumber;
    }

    public String getPID() {
        return PID;
    }

    public void setPID(String PID) {
        this.PID = PID;
    }

    public java.sql.Date getDate() {
        return date;
    }

    public void setDate(java.sql.Date date) {
        this.date = date;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Store getStore_StoreProductSale() {
        return store_StoreProductSale;
    }

    public void setStore_StoreProductSale(Store store_StoreProductSale) {
        this.store_StoreProductSale = store_StoreProductSale;
    }

    public Product getProduct_StoreProductSale() {
        return product_StoreProductSale;
    }

    public void setProduct_StoreProductSale(Product product_StoreProductSale) {
        this.product_StoreProductSale = product_StoreProductSale;
    }

    public Date getDate_StoreProductSale() {
        return date_StoreProductSale;
    }

    public void setDate_StoreProductSale(Date date_StoreProductSale) {
        this.date_StoreProductSale = date_StoreProductSale;
    }
}
