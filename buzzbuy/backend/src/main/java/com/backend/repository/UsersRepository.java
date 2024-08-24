package com.backend.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, String> {
    @Query("SELECT CONCAT(u.last4DigitsSSN, '-', UPPER(SUBSTRING(u.lastName, 1, 1)), SUBSTRING(u.lastName, 2)) " +
            "AS truePassword " +
            "FROM Users u " +
            "WHERE u.employeeID = :employeeID")
    String findTruePasswordByEmployeeID(@Param("employeeID") String employeeID);

    @Query("SELECT u.firstName, u.lastName, u.auditLogAccess FROM Users u WHERE u.employeeID = :employeeID")
    Optional<Object> findUserDetailsByEmployeeID(@Param("employeeID") String employeeID);
}
