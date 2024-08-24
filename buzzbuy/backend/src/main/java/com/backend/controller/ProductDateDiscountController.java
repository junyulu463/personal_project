
package com.backend.controller;

import com.backend.service.ProductDateDiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/product-date-discounts")
public class ProductDateDiscountController {

    @Autowired
    private ProductDateDiscountService productDateDiscountService;

    @PostMapping("/upload")
    public String uploadProductDateDiscounts() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/Discount.tsv";
        try {
            productDateDiscountService.loadProductDateDiscounts(filePath);
            return "Product date discounts loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading product date discounts: " + e.getMessage();
        }
    }
}

