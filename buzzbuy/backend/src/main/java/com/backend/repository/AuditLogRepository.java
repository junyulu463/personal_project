package com.backend.repository;

import com.backend.entity.AuditLog;
import com.backend.entity.AuditLogId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import org.springframework.data.domain.Pageable;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, AuditLogId> {
    // 1. Check audit log access for a user
    @Query("SELECT u.auditLogAccess FROM Users u WHERE u.employeeID = :employeeID")
    boolean findAuditLogAccessByEmployeeID(@Param("employeeID") String employeeID);

    // 2. Find users who have access to all districts
    @Query("SELECT u.employeeID " +
            "FROM Users u " +
            "JOIN UsersDistrictAssigned uda ON u.employeeID = uda.employeeID " +
            "GROUP BY u.employeeID " +
            "HAVING COUNT(uda.districtNumber) = (SELECT COUNT(d) FROM District d)")
    List<String> findUsersWithAccessToAllDistricts();

    // 3. Fetch recent audit log entries
    @Query("SELECT al.timestamp, u.employeeID, u.lastName, u.firstName, al.reportName " +
            "FROM AuditLog al " +
            "INNER JOIN Users u ON al.employeeID = u.employeeID " +
            "ORDER BY al.timestamp DESC, u.employeeID ASC")
    List<Object[]> findRecentAuditLogEntries(Pageable pageable);
}
