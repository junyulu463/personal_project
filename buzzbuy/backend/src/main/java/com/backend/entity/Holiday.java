package com.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Holiday")
public class Holiday {
    @Id
    @Column(name = "date", nullable = false)
    private java.sql.Date date;

    @Column(name = "holidayName", length = 250, nullable = false)
    private String holidayName;

    @Column(name = "employeeID", length = 12, nullable = false)
    private String employeeID;

    @OneToOne
    @JoinColumn(name = "date", referencedColumnName = "date", insertable = false, updatable = false)
    private com.backend.entity.Date dateRef;

    @ManyToOne
    @JoinColumn(name = "employeeID", referencedColumnName = "employeeID", insertable = false, updatable = false)
    private Users employee;

    public java.sql.Date getDate() {
        return date;
    }

    public void setDate(java.sql.Date date) {
        this.date = date;
    }

    public String getHolidayName() {
        return holidayName;
    }

    public void setHolidayName(String holidayName) {
        this.holidayName = holidayName;
    }

    public String getEmployeeID() {
        return employeeID;
    }

    public void setEmployeeID(String employeeID) {
        this.employeeID = employeeID;
    }

    public Date getDateRef() {
        return dateRef;
    }

    public void setDateRef(Date dateRef) {
        this.dateRef = dateRef;
    }

    public Users getEmployee() {
        return employee;
    }

    public void setEmployee(Users employee) {
        this.employee = employee;
    }
}
