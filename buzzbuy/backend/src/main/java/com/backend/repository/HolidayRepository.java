package com.backend.repository;

import com.backend.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, java.util.Date> {
    @Query("SELECT COUNT(h) FROM Holiday h")
    long countHolidays();

    @Query("SELECT COUNT(*) FROM Holiday WHERE date = :date")
    int countHolidaysByDate(@Param("date") java.sql.Date date);

    @Query("SELECT COUNT(*) FROM UsersDistrictAssigned WHERE employeeID = :employeeID")
    int countUserAssignedDistricts(@Param("employeeID") String employeeID);

    @Query("SELECT COUNT(*) FROM District")
    int countTotalDistricts();
}
