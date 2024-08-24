package com.backend.entity;

import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "City")
@IdClass(CityId.class)
public class City {
    @Id
    @Column(name = "cityName", length = 250, nullable = false)
    private String cityName;

    @Id
    @Column(name = "state", length = 250, nullable = false)
    private String state;

    @Column(name = "population", nullable = false)
    private int population;

    @OneToMany(mappedBy = "city",cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Store> stores;

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public int getPopulation() {
        return population;
    }

    public void setPopulation(int population) {
        this.population = population;
    }

    public Set<Store> getStores() {
        return stores;
    }

    public void setStores(Set<Store> stores) {
        this.stores = stores;
    }
}
