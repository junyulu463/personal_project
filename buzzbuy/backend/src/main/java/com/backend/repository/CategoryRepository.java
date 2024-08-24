package com.backend.repository;

import com.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    @Query("SELECT COUNT(c) FROM Category c")
    long countCategories();

    @Query(value = "SELECT " +
            "pca.category_name, " +
            "COUNT(p.PID) AS total_products, " +
            "COUNT(DISTINCT p.manufacturer_name) AS total_manufacturers, " +
            "AVG(p.retail_price) AS avg_retailPrice " +
            "FROM Product_Category_Assigned pca " +
            "INNER JOIN Product p ON pca.PID = p.PID " +
            "GROUP BY pca.category_name " +
            "ORDER BY pca.category_name ASC", nativeQuery = true)
    List<Object[]> getCategoryStatistics();

    @Query(value = "SELECT YEAR(date) AS year, " +
            "SUM(quantity) AS unitSoldYearly, " +
            "SUM(quantity) / 365.0 AS AverageUnitSoldPerDay, " +
            "SUM(CASE WHEN MONTH(date) = 2 AND DAY(date) = 2 THEN quantity ELSE 0 END) AS unitSoldOnGroundhog " +
            "FROM Store_Product_Sale sps " +
            "WHERE store_number IN (" +
            "   SELECT store_number " +
            "   FROM Store " +
            "   WHERE district_number IN (" +
            "       SELECT district_number " +
            "       FROM Users_District_Assigned " +
            "       WHERE employeeID = :employeeID" +
            "   )" +
            ") AND PID IN (" +
            "   SELECT PID " +
            "   FROM Product_Category_Assigned " +
            "   WHERE category_name = 'air conditioning'" +
            ") " +
            "GROUP BY YEAR(date) " +
            "ORDER BY year ASC", nativeQuery = true)
    List<Object[]> getAirConditionerStatistics(@Param("employeeID") String employeeID);
}
