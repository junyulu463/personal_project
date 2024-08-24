package com.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Set;

@Entity
@Table(name = "Product")
public class Product {
    @Id
    @Column(name = "PID", length = 12, nullable = false)
    private String PID;

    @Column(name = "productName", length = 250, nullable = false)
    private String productName;

    @Column(name = "retailPrice", nullable = false, precision = 19, scale = 2)
    private BigDecimal retailPrice;

    @Column(name = "manufacturerName", length = 250, nullable = false)
    private String manufacturerName;

    @ManyToOne
    @JoinColumn(name = "manufacturerName", referencedColumnName = "manufacturerName", insertable = false, updatable = false)
    private Manufacturer manufacturer;

    @OneToMany(mappedBy = "product_ProductDateDiscount")
    private Set<ProductDateDiscount> productDateDiscounts;

    @OneToMany(mappedBy = "product_ProductCategoryAssigned")
    private Set<ProductCategoryAssigned> productCategoryAssigneds;

    @OneToMany(mappedBy = "product_StoreProductSale")
    private Set<StoreProductSale> storeProductSales;

    public String getPID() {
        return PID;
    }

    public void setPID(String PID) {
        this.PID = PID;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public BigDecimal getRetailPrice() {
        return retailPrice;
    }

    public void setRetailPrice(BigDecimal retailPrice) {
        this.retailPrice = retailPrice;
    }

    public String getManufacturerName() {
        return manufacturerName;
    }

    public void setManufacturerName(String manufacturerName) {
        this.manufacturerName = manufacturerName;
    }

    public Manufacturer getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(Manufacturer manufacturer) {
        this.manufacturer = manufacturer;
    }

    public Set<ProductDateDiscount> getProductDateDiscounts() {
        return productDateDiscounts;
    }

    public void setProductDateDiscounts(Set<ProductDateDiscount> productDateDiscounts) {
        this.productDateDiscounts = productDateDiscounts;
    }

    public Set<ProductCategoryAssigned> getProductCategoryAssigneds() {
        return productCategoryAssigneds;
    }

    public void setProductCategoryAssigneds(Set<ProductCategoryAssigned> productCategoryAssigneds) {
        this.productCategoryAssigneds = productCategoryAssigneds;
    }

    public Set<StoreProductSale> getStoreProductSales() {
        return storeProductSales;
    }

    public void setStoreProductSales(Set<StoreProductSale> storeProductSales) {
        this.storeProductSales = storeProductSales;
    }
}
