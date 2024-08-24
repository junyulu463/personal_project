package com.backend.controller;

import com.backend.service.ProductCategoryAssignedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/product-category-assigned")
public class ProductCategoryAssignedController {

    @Autowired
    private ProductCategoryAssignedService productCategoryAssignedService;

    @PostMapping("/upload")
    public String uploadProductCategoryAssigned() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/Product.tsv";
        try {
            productCategoryAssignedService.loadProductCategoryAssigned(filePath);
            return "Product category assignments loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading product category assignments: " + e.getMessage();
        }
    }
}
