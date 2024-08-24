package com.backend.entity;

import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "Store")
public class Store {
    @Id
    @Column(name = "storeNumber", length = 12, nullable = false)
    private String storeNumber;

    @Column(name = "phoneNumber", length = 15, nullable = false)
    private String phoneNumber;

    @Column(name = "cityName", length = 250, nullable = false)
    private String cityName;

    @Column(name = "state", length = 250, nullable = false)
    private String state;

    @Column(name = "districtNumber", length = 12, nullable = false)
    private String districtNumber;

    @ManyToOne
    @JoinColumns({
            @JoinColumn(name = "cityName", referencedColumnName = "cityName", insertable = false, updatable = false),
            @JoinColumn(name = "state", referencedColumnName = "state", insertable = false, updatable = false)
    })
    private City city;

    @ManyToOne
    @JoinColumn(name = "districtNumber", referencedColumnName = "districtNumber", insertable = false, updatable = false)
    private District district;

    @OneToMany(mappedBy = "store_StoreProductSale")
    private Set<StoreProductSale> storeProductSales;

    public String getStoreNumber() {
        return storeNumber;
    }

    public void setStoreNumber(String storeNumber) {
        this.storeNumber = storeNumber;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

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

    public String getDistrictNumber() {
        return districtNumber;
    }

    public void setDistrictNumber(String districtNumber) {
        this.districtNumber = districtNumber;
    }

    public City getCity() {
        return city;
    }

    public void setCity(City city) {
        this.city = city;
    }

    public District getDistrict() {
        return district;
    }

    public void setDistrict(District district) {
        this.district = district;
    }

    public Set<StoreProductSale> getStoreProductSales() {
        return storeProductSales;
    }

    public void setStoreProductSales(Set<StoreProductSale> storeProductSales) {
        this.storeProductSales = storeProductSales;
    }
}

