package com.backend.service;

import com.backend.entity.ProductCategoryAssigned;
import com.backend.repository.ProductCategoryAssignedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductCategoryAssignedService {

    @Autowired
    private ProductCategoryAssignedRepository productCategoryAssignedRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final int BATCH_SIZE = 100;

    public void loadProductCategoryAssigned(String filePath) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            List<ProductCategoryAssigned> batchList = new ArrayList<>();

            // Disable foreign key checks
            //jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS=0");

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                String pid = fields[0];
                String categories = fields[4];

                // Split the categories by comma and trim any whitespace
                String[] categoryArray = categories.split(",");

                for (String category : categoryArray) {
                    ProductCategoryAssigned productCategoryAssigned = new ProductCategoryAssigned();
                    productCategoryAssigned.setPID(pid);
                    productCategoryAssigned.setCategoryName(category.trim());

                    batchList.add(productCategoryAssigned);

                    if (batchList.size() == BATCH_SIZE) {
                        productCategoryAssignedRepository.saveAll(batchList);
                        batchList.clear();
                    }
                }
            }

            // Save any remaining records
            if (!batchList.isEmpty()) {
                productCategoryAssignedRepository.saveAll(batchList);
            }
        }
    }
}
