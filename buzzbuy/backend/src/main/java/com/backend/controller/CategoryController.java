package com.backend.controller;

import com.backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping("/upload")
    public String uploadCategories() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/Category.tsv";
        try {
            categoryService.loadCategories(filePath);
            return "Categories loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading categories: " + e.getMessage();
        }
    }

    @GetMapping("/count")
    public long countCategories() {
        return categoryService.countCategories();
    }


    /**
     * Endpoint to fetch category product statistics.
     *
     * @return A list of category product statistics.
     */
    @GetMapping("/statistics")
    public List<Object[]> getCategoryProductStatistics() {
        return categoryService.getCategoryProductStatistics();
    }

    @GetMapping("/air-conditioner-statistics")
    public List<Object[]> getAirConditionerStatistics(@RequestParam String employeeID) {
        return categoryService.getAirConditionerStatistics(employeeID);
    }
}
