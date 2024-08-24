package com.backend.controller;

import com.backend.service.ManufacturerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manufacturers")
public class ManufacturerController {

    @Autowired
    private ManufacturerService manufacturerService;

    @PostMapping("/upload")
    public String uploadManufacturers() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/Manufacturer.tsv";
        try {
            manufacturerService.loadManufacturers(filePath);
            return "Manufacturers loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading manufacturers: " + e.getMessage();
        }
    }

    @GetMapping("/count")
    public long countManufacturers() {
        return manufacturerService.countManufacturers();
    }

    @GetMapping("/statistics")
    public List<Map<String, Object>> getManufacturerProductStatistics() {
        return manufacturerService.getManufacturerProductStatistics();
    }

    @GetMapping("/products")
    public List<Object[]> getProductsByManufacturer(@RequestParam String manufacturerName) {
        return manufacturerService.getProductsByManufacturer(manufacturerName);
    }
}
