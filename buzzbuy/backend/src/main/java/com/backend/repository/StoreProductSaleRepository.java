package com.backend.repository;

import com.backend.entity.StoreProductSale;
import com.backend.entity.StoreProductSaleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreProductSaleRepository extends JpaRepository<StoreProductSale, StoreProductSaleId> {
    @Query(value = "SELECT *, actualRevenue - predictedRevenue AS revenueDifference " +
            "FROM ( " +
            "    SELECT sps.PID, product_name, retail_price, " +
            "           SUM(quantity) AS totalUnitSold, " +
            "           SUM(CASE WHEN discount_price IS NOT NULL THEN quantity ELSE 0 END) AS unitSoldAtDiscount, " +
            "           SUM(CASE WHEN discount_price IS NULL THEN quantity ELSE 0 END) AS unitSoldAtRetailPrice, " +
            "           SUM(CASE WHEN discount_price IS NOT NULL THEN quantity * discount_price ELSE quantity * retail_price END) AS actualRevenue, " +
            "           SUM(CASE WHEN discount_price IS NULL THEN quantity * 0.75 * retail_price ELSE quantity * retail_price END) AS predictedRevenue " +
            "    FROM Store_Product_Sale sps " +
            "    INNER JOIN Product_Category_Assigned pca ON sps.PID = pca.PID " +
            "    LEFT OUTER JOIN Product_Date_Discount pdd ON sps.PID = pdd.PID AND sps.date = pdd.date " +
            "    INNER JOIN Product p ON sps.PID = p.PID " +
            "    WHERE category_name = 'GPS' AND sps.store_number IN ( " +
            "        SELECT store_number FROM Store " +
            "        WHERE district_number IN ( " +
            "            SELECT district_number " +
            "            FROM Users_District_Assigned " +
            "            WHERE employeeID = :employeeID " +
            "        ) " +
            "    ) " +
            "    GROUP BY sps.PID, product_name, retail_price " +
            ") AS revenueCalculations " +
            "HAVING actualRevenue - predictedRevenue > 200 OR actualRevenue - predictedRevenue < -200 " +
            "ORDER BY revenueDifference DESC;",
            nativeQuery = true)
    List<Object[]> findGpsRevenueDifference(@Param("employeeID") String employeeID);
}
