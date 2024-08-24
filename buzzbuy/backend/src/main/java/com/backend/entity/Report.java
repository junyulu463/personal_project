package com.backend.entity;

import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "Report")
public class Report {
    @Id
    @Column(name = "reportName", length = 250, nullable = false)
    private String reportName;

    public String getReportName() {
        return reportName;
    }

    @OneToMany(mappedBy = "report_AuditLog")
    private Set<AuditLog> auditLogs;

    public void setReportName(String reportName) {
        this.reportName = reportName;
    }

    public Set<AuditLog> getAuditLogs() {
        return auditLogs;
    }

    public void setAuditLogs(Set<AuditLog> auditLogs) {
        this.auditLogs = auditLogs;
    }
}
