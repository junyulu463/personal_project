package com.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "Product_Date_Discount")
@IdClass(ProductDateDiscountId.class)
public class ProductDateDiscount {
    @Id
    @Column(name = "PID", length = 12, nullable = false)
    private String PID;
    @Id
    @Column(name = "date", nullable = false)
    private java.sql.Date date;
    @Column(name = "discountPrice", nullable = false, precision = 19, scale = 2)
    private BigDecimal discountPrice;

    @ManyToOne
    @JoinColumn(name = "PID", referencedColumnName = "PID", insertable = false, updatable = false)
    private Product product_ProductDateDiscount;

    @ManyToOne
    @JoinColumn(name = "date", referencedColumnName = "date", insertable = false, updatable = false)
    private com.backend.entity.Date date_ProductDateDiscount;

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

    public BigDecimal getDiscountPrice() {
        return discountPrice;
    }

    public void setDiscountPrice(BigDecimal discountPrice) {
        this.discountPrice = discountPrice;
    }

    public Product getProduct_ProductDateDiscount() {
        return product_ProductDateDiscount;
    }

    public void setProduct_ProductDateDiscount(Product product_ProductDateDiscount) {
        this.product_ProductDateDiscount = product_ProductDateDiscount;
    }

    public Date getDate_ProductDateDiscount() {
        return date_ProductDateDiscount;
    }

    public void setDate_ProductDateDiscount(Date date_ProductDateDiscount) {
        this.date_ProductDateDiscount = date_ProductDateDiscount;
    }
}