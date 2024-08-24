package com.backend.repository;

import com.backend.entity.Manufacturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ManufacturerRepository extends JpaRepository<Manufacturer, String> {
    @Query("SELECT COUNT(m) FROM Manufacturer m")
    long countManufacturers();

    @Query(value = "SELECT m.manufacturer_name, COUNT(p.PID) AS total_products, AVG(p.retail_price) AS avg_retailPrice, " +
            "MIN(p.retail_price) AS min_retailPrice, MAX(p.retail_price) AS max_retailPrice " +
            "FROM Manufacturer m " +
            "LEFT OUTER JOIN Product p ON m.manufacturer_name = p.manufacturer_name " +
            "GROUP BY m.manufacturer_name " +
            "ORDER BY avg_retailPrice DESC " +
            "LIMIT 100", nativeQuery = true)
    List<Object[]> getManufacturerProductStatistics();

    @Query(value = "SELECT p.PID, p.product_name, cs.categories, p.retail_price " +
            "FROM Product p " +
            "NATURAL JOIN " +
            "( " +
            "    SELECT PID, GROUP_CONCAT(category_name SEPARATOR ', ') AS categories " +
            "    FROM Product_Category_Assigned " +
            "    GROUP BY PID " +
            ") AS cs " +
            "WHERE p.manufacturer_name = :manufacturerName " +
            "ORDER BY p.retail_price DESC", nativeQuery = true)
    List<Object[]> getProductsByManufacturer(@Param("manufacturerName") String manufacturerName);
}
