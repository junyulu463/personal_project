package com.backend.repository;

import com.backend.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreRepository extends JpaRepository<Store, String> {
    @Query("SELECT COUNT(s) FROM Store s")
    long countStores();

    // 1. Get distinct states
    @Query(value = "SELECT DISTINCT state FROM City", nativeQuery = true)
    List<String> getDistinctStates();

    // 2. Get store revenue by state and year
    @Query(value = "SELECT s.store_number, s.city_name, YEAR(sps.date) AS year, " +
            "SUM(CASE WHEN discount_price IS NOT NULL THEN discount_price * quantity ELSE retail_price * quantity END) AS store_revenue " +
            "FROM Store_Product_Sale sps " +
            "NATURAL JOIN Product p " +
            "NATURAL JOIN Store s " +
            "LEFT JOIN Product_Date_Discount pdd ON sps.PID = pdd.PID AND sps.date = pdd.date " +
            "WHERE state = :state " +
            "GROUP BY s.store_number, s.city_name, YEAR(sps.date) " +
            "ORDER BY year ASC, store_revenue DESC", nativeQuery = true)
    List<Object[]> getStoreRevenueByState(@Param("state") String state);
}
