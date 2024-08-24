package com.backend.service;

import com.backend.entity.ProductDateDiscount;
import com.backend.repository.ProductDateDiscountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import com.backend.util.DateUtils;

@Service
public class ProductDateDiscountService {

    @Autowired
    private ProductDateDiscountRepository productDateDiscountRepository;

    private static final int BATCH_SIZE = 1000; // Adjust batch size as needed

    public void loadProductDateDiscounts(String filePath) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            List<ProductDateDiscount> batchList = new ArrayList<>();

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                ProductDateDiscount productDateDiscount = new ProductDateDiscount();
                productDateDiscount.setPID(fields[1]);
                productDateDiscount.setDate(DateUtils.convertStringToSqlDate(fields[0]));
                productDateDiscount.setDiscountPrice(new BigDecimal(fields[2]));

                batchList.add(productDateDiscount);

                // When batch size is reached, save the batch and clear the list
                if (batchList.size() == BATCH_SIZE) {
                    productDateDiscountRepository.saveAll(batchList);
                    batchList.clear();
                }
            }

            // Save any remaining records that didn't fill a complete batch
            if (!batchList.isEmpty()) {
                productDateDiscountRepository.saveAll(batchList);
            }
        }
    }
}

