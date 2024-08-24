package com.backend.controller;

import com.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping("/upload")
    public String uploadProducts() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/Product.tsv";
        try {
            productService.loadProducts(filePath);
            return "Products loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading products: " + e.getMessage();
        }
    }

    @GetMapping("/count")
    public long countProducts() {
        return productService.countProducts();
    }
}
