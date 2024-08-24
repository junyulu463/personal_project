package com.backend.entity;

import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "Category")
public class Category {
    @Id
    @Column(name = "categoryName", length = 250, nullable = false)
    private String categoryName;

    public String getCategoryName() {
        return categoryName;
    }

    @OneToMany(mappedBy = "category_productCategoryAssigned")
    private Set<ProductCategoryAssigned> productCategoryAssigneds;

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Set<ProductCategoryAssigned> getProductCategoryAssigneds() {
        return productCategoryAssigneds;
    }

    public void setProductCategoryAssigneds(Set<ProductCategoryAssigned> productCategoryAssigneds) {
        this.productCategoryAssigneds = productCategoryAssigneds;
    }
}
