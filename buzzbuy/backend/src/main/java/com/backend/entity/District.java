package com.backend.entity;

import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "District")
public class District {
    @Id
    @Column(name = "districtNumber", length = 12, nullable = false)
    private String districtNumber;

    @OneToMany(mappedBy = "district")
    private Set<Store> stores;

    @OneToMany(mappedBy = "district_UsersDistrictAssigned")
    private Set<UsersDistrictAssigned> usersDistrictAssigneds;

    public String getDistrictNumber() {
        return districtNumber;
    }

    public void setDistrictNumber(String districtNumber) {
        this.districtNumber = districtNumber;
    }

    public Set<Store> getStores() {
        return stores;
    }

    public void setStores(Set<Store> stores) {
        this.stores = stores;
    }

    public Set<UsersDistrictAssigned> getUsersDistrictAssigneds() {
        return usersDistrictAssigneds;
    }

    public void setUsersDistrictAssigneds(Set<UsersDistrictAssigned> usersDistrictAssigneds) {
        this.usersDistrictAssigneds = usersDistrictAssigneds;
    }
}

