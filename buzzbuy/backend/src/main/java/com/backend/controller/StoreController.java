package com.backend.controller;

import com.backend.service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    @Autowired
    private StoreService storeService;

    @PostMapping("/upload")
    public String uploadStores() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/Store.tsv";
        try {
            storeService.loadStores(filePath);
            return "Stores loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading stores: " + e.getMessage();
        }
    }

    @GetMapping("/count")
    public long countStores() {
        return storeService.countStores();
    }

    // Get distinct states
    @GetMapping("/states")
    public List<String> getDistinctStates() {
        return storeService.getDistinctStates();
    }

    // Get store revenue by state and year
    @GetMapping("/revenue-by-state")
    public List<Object[]> getStoreRevenueByState(@RequestParam String state) {
        return storeService.getStoreRevenueByState(state);
    }
}
