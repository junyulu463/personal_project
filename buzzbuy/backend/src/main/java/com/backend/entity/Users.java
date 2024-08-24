package com.backend.entity;

import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "Users")
public class Users {
    @Id
    @Column(name = "employeeID", length = 12, nullable = false)
    private String employeeID;

    @Column(name = "last4DigitsSSN", length = 4, nullable = false)
    private String last4DigitsSSN;

    @Column(name = "firstName", length = 250, nullable = false)
    private String firstName;

    @Column(name = "lastName", length = 250, nullable = false)
    private String lastName;

    @Column(name = "auditLogAccess", nullable = false)
    private boolean auditLogAccess = false;

    @OneToMany(mappedBy = "employee")
    private Set<Holiday> holidays;

    @OneToMany(mappedBy = "employee_UsersDistrictAssigned")
    private  Set<UsersDistrictAssigned> usersDistrictAssigneds;

    @OneToMany(mappedBy = "employee_AuditLog")
    private Set<AuditLog> auditLogs;

    public String getEmployeeID() {
        return employeeID;
    }

    public void setEmployeeID(String employeeID) {
        this.employeeID = employeeID;
    }

    public String getLast4DigitsSSN() {
        return last4DigitsSSN;
    }

    public void setLast4DigitsSSN(String last4DigitsSSN) {
        this.last4DigitsSSN = last4DigitsSSN;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public boolean isAuditLogAccess() {
        return auditLogAccess;
    }

    public void setAuditLogAccess(boolean auditLogAccess) {
        this.auditLogAccess = auditLogAccess;
    }

    public Set<Holiday> getHolidays() {
        return holidays;
    }

    public void setHolidays(Set<Holiday> holidays) {
        this.holidays = holidays;
    }

    public Set<UsersDistrictAssigned> getUsersDistrictAssigneds() {
        return usersDistrictAssigneds;
    }

    public void setUsersDistrictAssigneds(Set<UsersDistrictAssigned> usersDistrictAssigneds) {
        this.usersDistrictAssigneds = usersDistrictAssigneds;
    }

    public Set<AuditLog> getAuditLogs() {
        return auditLogs;
    }

    public void setAuditLogs(Set<AuditLog> auditLogs) {
        this.auditLogs = auditLogs;
    }
}
