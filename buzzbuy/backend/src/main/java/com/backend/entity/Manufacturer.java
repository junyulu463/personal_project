package com.backend.entity;

import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "Manufacturer")
public class Manufacturer {
    @Id
    @Column(name = "manufacturerName", length = 250, nullable = false)
    private String manufacturerName;

    @OneToMany(mappedBy = "manufacturer")
    private Set<Product> products;

    public String getManufacturerName() {
        return manufacturerName;
    }

    public void setManufacturerName(String manufacturerName) {
        this.manufacturerName = manufacturerName;
    }

    public Set<Product> getProducts() {
        return products;
    }

    public void setProducts(Set<Product> products) {
        this.products = products;
    }
}

