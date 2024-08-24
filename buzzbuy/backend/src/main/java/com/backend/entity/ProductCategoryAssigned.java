package com.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Product_Category_Assigned")
@IdClass(ProductCategoryAssignedId.class)
public class ProductCategoryAssigned {
    @Id
    @Column(name = "PID", length = 12, nullable = false)
    private String PID;

    @Id
    @Column(name = "categoryName", length = 250, nullable = false)
    private String categoryName;

    @ManyToOne
    @JoinColumn(name = "PID", referencedColumnName = "PID", insertable = false, updatable = false)
    private Product product_ProductCategoryAssigned;

    @ManyToOne
    @JoinColumn(name = "categoryName", referencedColumnName = "categoryName", insertable = false, updatable = false)
    private Category category_productCategoryAssigned;

    public String getPID() {
        return PID;
    }

    public void setPID(String PID) {
        this.PID = PID;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Product getProduct_ProductCategoryAssigned() {
        return product_ProductCategoryAssigned;
    }

    public void setProduct_ProductCategoryAssigned(Product product_ProductCategoryAssigned) {
        this.product_ProductCategoryAssigned = product_ProductCategoryAssigned;
    }

    public Category getCategory_productCategoryAssigned() {
        return category_productCategoryAssigned;
    }

    public void setCategory_productCategoryAssigned(Category category_productCategoryAssigned) {
        this.category_productCategoryAssigned = category_productCategoryAssigned;
    }
}
