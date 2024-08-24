package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;

@Entity
@Table(name = "AuditLog")
@IdClass(AuditLogId.class)
public class AuditLog {
    @Id
    @Column(name = "employeeID")
    private String employeeID;
    @Id
    @Column(name = "timestamp")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss.SSS")
    private java.sql.Timestamp timestamp;
    @Column(name = "reportName")
    private String reportName;

    @ManyToOne
    @JoinColumn(name = "employeeID", referencedColumnName = "employeeID", insertable = false, updatable = false)
    private Users employee_AuditLog;

    @ManyToOne
    @JoinColumn(name = "reportName", referencedColumnName = "reportName", insertable = false, updatable = false)
    private Report report_AuditLog;

    public String getEmployeeID() {
        return employeeID;
    }

    public void setEmployeeID(String employeeID) {
        this.employeeID = employeeID;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Timestamp timestamp) {
        // Format the timestamp to "yyyy-MM-dd HH:mm:ss.SS" format
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String formattedTimestamp = sdf.format(timestamp);

        // Parse the formatted string back to a Timestamp
        this.timestamp = Timestamp.valueOf(formattedTimestamp);

    }

    public String getReportName() {
        return reportName;
    }

    public void setReportName(String reportName) {
        this.reportName = reportName;
    }

    public Users getEmployee_AuditLog() {
        return employee_AuditLog;
    }

    public void setEmployee_AuditLog(Users employee_AuditLog) {
        this.employee_AuditLog = employee_AuditLog;
    }

    public Report getReport_AuditLog() {
        return report_AuditLog;
    }

    public void setReport_AuditLog(Report report_AuditLog) {
        this.report_AuditLog = report_AuditLog;
    }
}
