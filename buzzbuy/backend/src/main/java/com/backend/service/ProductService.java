package com.backend.service;

import com.backend.entity.Product;
import com.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    private static final int BATCH_SIZE = 1000; // Define your batch size

    public void loadProducts(String filePath) throws IOException {
        List<Product> products = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                Product product = new Product();
                product.setPID(fields[0]);
                product.setProductName(fields[1]);
                product.setRetailPrice(new BigDecimal(fields[3]));
                product.setManufacturerName(fields[2]);

                products.add(product);

                // Check if batch is ready to be saved
                if (products.size() == BATCH_SIZE) {
                    productRepository.saveAll(products);
                    products.clear(); // Clear the list after saving
                }
            }

            // Save any remaining products that didn't fill a batch
            if (!products.isEmpty()) {
                productRepository.saveAll(products);
            }
        }
    }

    public long countProducts() {
        return productRepository.countProducts();
    }
}
