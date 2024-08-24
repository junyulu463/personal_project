package com.backend.service;

import com.backend.entity.AuditLog;
import com.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.backend.util.DateUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashSet;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;
    private static  final Logger logger = LoggerFactory.getLogger(AuditLogService.class);
    public void loadAuditLogs(String filePath) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                AuditLog auditLog = new AuditLog();
                auditLog.setEmployeeID(fields[1]);
                auditLog.setReportName(fields[2]);
                auditLog.setTimestamp(DateUtils.convertStringToTimestamp(fields[0]));
                auditLogRepository.save(auditLog);
            }
        }
    }

    /**
     * Fetch the recent audit log entries.
     *
     * @return A list of recent audit log entries as a list of objects containing timestamp, employeeID, lastName, firstName, and reportName.
     */
    public List<Object[]> fetchRecentAuditLogEntries() {
        Pageable limit = PageRequest.of(0, 100);  // Equivalent to LIMIT 100

        // Fetch recent audit log entries with a limit of 100
        List<Object[]> recentAuditLogs = auditLogRepository.findRecentAuditLogEntries(limit);

        // Fetch users who have access to all districts
        List<String> allDistrictUsers = auditLogRepository.findUsersWithAccessToAllDistricts();

        // Convert the list of users who have access to all districts into a set for quick lookup
        Set<String> allDistrictUserSet = new HashSet<>(allDistrictUsers);

        // Add a boolean flag to each log entry indicating if the user has access to all districts
        List<Object[]> updatedAuditLogs = recentAuditLogs.stream().map(logEntry -> {
            String employeeID = (String) logEntry[1]; // Assuming employeeID is the second element in the Object array
            boolean hasAccessToAllDistricts = allDistrictUserSet.contains(employeeID);
            return new Object[]{logEntry[0], logEntry[1], logEntry[2], logEntry[3], logEntry[4], hasAccessToAllDistricts}; // Adding the boolean flag
        }).collect(Collectors.toList());
        return updatedAuditLogs;
    }

    public void logReportAccess(String employeeID, String reportName) {
        AuditLog auditLog = new AuditLog();
        auditLog.setEmployeeID(employeeID);
        auditLog.setTimestamp(new java.sql.Timestamp(System.currentTimeMillis()));
        auditLog.setReportName(reportName);
        auditLogRepository.save(auditLog);
    }
}
