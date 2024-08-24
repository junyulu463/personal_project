package com.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Users_District_Assigned")
@IdClass(UsersDistrictAssignedId.class)
public class UsersDistrictAssigned {
    @Id
    @Column(name = "districtNumber", length = 12, nullable = false)
    private String districtNumber;

    @Id
    @Column(name = "employeeID", length = 12, nullable = false)
    private String employeeID;

    @ManyToOne
    @JoinColumn(name = "districtNumber", referencedColumnName = "districtNumber", insertable = false, updatable = false)
    private District district_UsersDistrictAssigned;

    @ManyToOne
    @JoinColumn(name = "employeeID", referencedColumnName = "employeeID", insertable = false, updatable = false)
    private Users employee_UsersDistrictAssigned;

    public String getDistrictNumber() {
        return districtNumber;
    }

    public void setDistrictNumber(String districtNumber) {
        this.districtNumber = districtNumber;
    }

    public String getEmployeeID() {
        return employeeID;
    }

    public void setEmployeeID(String employeeID) {
        this.employeeID = employeeID;
    }

    public District getDistrict_UsersDistrictAssigned() {
        return district_UsersDistrictAssigned;
    }

    public void setDistrict_UsersDistrictAssigned(District district_UsersDistrictAssigned) {
        this.district_UsersDistrictAssigned = district_UsersDistrictAssigned;
    }

    public Users getEmployee_UsersDistrictAssigned() {
        return employee_UsersDistrictAssigned;
    }

    public void setEmployee_UsersDistrictAssigned(Users employee_UsersDistrictAssigned) {
        this.employee_UsersDistrictAssigned = employee_UsersDistrictAssigned;
    }
}
