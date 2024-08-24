package com.backend.controller;

import com.backend.service.StoreProductSaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/store-product-sales")
public class StoreProductSaleController {

    @Autowired
    private StoreProductSaleService storeProductSaleService;

    @PostMapping("/upload")
    public String uploadStoreProductSales() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/Sold.tsv";
        try {
            storeProductSaleService.loadStoreProductSales(filePath);
            return "Store product sales loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading store product sales: " + e.getMessage();
        }
    }

    @GetMapping("/gps-revenue-difference")
    public List<Object[]> getGpsRevenueDifference(@RequestParam String employeeID) {
        return storeProductSaleService.getGpsRevenueDifference(employeeID);
    }
}
