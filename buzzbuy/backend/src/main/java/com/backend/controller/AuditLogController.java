package com.backend.controller;
import com.backend.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {
    @Autowired
    private AuditLogService auditLogService;

    @PostMapping("/upload")
    public String uploadAuditLogs() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/Audit_log.tsv";
        try {
            auditLogService.loadAuditLogs(filePath);
            return "Audit logs loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading audit logs: " + e.getMessage();
        }
    }
    /**
     * Endpoint to fetch recent audit log entries.
     *
     * @return A list of recent audit log entries.
     */
    @GetMapping("/recent")
    public List<Object[]> getRecentAuditLogEntries() {
        return auditLogService.fetchRecentAuditLogEntries();
    }

    @PostMapping("/log-report-access")
    public void logReportAccess(@RequestParam String employeeID, @RequestParam String reportName) {
        auditLogService.logReportAccess(employeeID, reportName);
    }
}
