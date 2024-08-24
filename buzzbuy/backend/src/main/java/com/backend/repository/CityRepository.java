package com.backend.repository;

import com.backend.entity.City;
import com.backend.entity.CityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface CityRepository extends JpaRepository<City, CityId> {
    @Query("SELECT COUNT(c) FROM City c")
    long countCities();

    @Query(value = "SELECT " +
            "revenue_data.year, " +
            "AVG(CASE WHEN citySize = 'Small' THEN revenue ELSE NULL END) AS 'Small', " +
            "AVG(CASE WHEN citySize = 'Medium' THEN revenue ELSE NULL END) AS 'Medium', " +
            "AVG(CASE WHEN citySize = 'Large' THEN revenue ELSE NULL END) AS 'Large', " +
            "AVG(CASE WHEN citySize = 'Extra Large' THEN revenue ELSE NULL END) AS 'Extra Large' " +
            "FROM (" +
            "    SELECT " +
            "        cs.citySize, " +
            "        YEAR(sps.date) AS year, " +
            "        SUM(CASE " +
            "            WHEN discount_price IS NOT NULL THEN discount_price * quantity " +
            "            ELSE retail_price * quantity " +
            "        END) AS revenue " +
            "    FROM Store_Product_Sale sps " +
            "    NATURAL JOIN Product p " +
            "    NATURAL JOIN Store s " +
            "    NATURAL JOIN (" +
            "        SELECT *, " +
            "            CASE " +
            "                WHEN population < 3700000 THEN 'Small' " +
            "                WHEN population >= 3700000 AND population < 6700000 THEN 'Medium' " +
            "                WHEN population >= 6700000 AND population < 9000000 THEN 'Large' " +
            "                ELSE 'Extra Large' " +
            "            END AS citySize " +
            "        FROM City c " +
            "    ) AS cs " +
            "    LEFT JOIN Product_Date_Discount pdd ON sps.PID = pdd.PID AND sps.date = pdd.date " +
            "    GROUP BY cs.citySize, s.store_number, YEAR(sps.date) " +
            ") AS revenue_data " +
            "GROUP BY revenue_data.year, revenue_data.citySize " +
            "ORDER BY revenue_data.year ASC, " +
            "CASE " +
            "    WHEN revenue_data.citySize = 'Small' THEN 1 " +
            "    WHEN revenue_data.citySize = 'Medium' THEN 2 " +
            "    WHEN revenue_data.citySize = 'Large' THEN 3 " +
            "    ELSE 4 " +
            "END ASC;", nativeQuery = true)
    List<Object[]> getCitySizeRevenueStatistics();
}
