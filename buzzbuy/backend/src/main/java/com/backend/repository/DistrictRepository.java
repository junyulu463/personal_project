package com.backend.repository;

import com.backend.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DistrictRepository extends JpaRepository<District, String> {
    @Query("SELECT COUNT(d) FROM District d")
    long countDistricts();

    // Query 1: Get distinct years and months
    @Query(value = "SELECT DISTINCT YEAR(date) AS year, MONTH(date) AS month FROM Date ORDER BY year, month", nativeQuery = true)
    List<Object[]> getDistinctYearsAndMonths();

    // Query 2: Get the district with the highest total units for each category
    @Query(value = "SELECT c.category_name, s.district_number, SUM(sps.quantity) AS total_units " +
            "FROM Product_Category_Assigned pca " +
            "NATURAL JOIN Store_Product_Sale sps " +
            "NATURAL JOIN Store s " +
            "RIGHT JOIN Category c ON pca.category_name = c.category_name " +
            "WHERE YEAR(sps.date) = :year AND MONTH(sps.date) = :month " +
            "GROUP BY c.category_name, s.district_number " +
            "HAVING SUM(sps.quantity) = ( " +
            "    SELECT MAX(total_units) " +
            "    FROM ( " +
            "        SELECT c2.category_name, s2.district_number, SUM(sps2.quantity) AS total_units " +
            "        FROM Product_Category_Assigned pca2 " +
            "        NATURAL JOIN Store_Product_Sale sps2 " +
            "        NATURAL JOIN Store s2 " +
            "        RIGHT JOIN Category c2 ON pca2.category_name = c2.category_name " +
            "        WHERE YEAR(sps2.date) = :year AND MONTH(sps2.date) = :month " +
            "        GROUP BY c2.category_name, s2.district_number " +
            "    ) AS category_totals " +
            "    WHERE category_totals.category_name = c.category_name " +
            ") " +
            "ORDER BY c.category_name ASC", nativeQuery = true)
    List<Object[]> getHighestVolumeByCategoryAndDistrict(@Param("year") int year, @Param("month") int month);

    // Query 3: Get distinct stores for a given category and district
    @Query(value = "SELECT DISTINCT s.store_number, s.state, s.city_name " +
            "FROM Product_Category_Assigned pca " +
            "NATURAL JOIN Store_Product_Sale sps " +
            "NATURAL JOIN Store s " +
            "WHERE YEAR(sps.date) = :year AND MONTH(sps.date) = :month AND pca.category_name = :categoryName AND s.district_number = :districtNumber " +
            "ORDER BY s.store_number ASC", nativeQuery = true)
    List<Object[]> getStoresByCategoryAndDistrict(@Param("year") int year, @Param("month") int month, @Param("categoryName") String categoryName, @Param("districtNumber") int districtNumber);
}
