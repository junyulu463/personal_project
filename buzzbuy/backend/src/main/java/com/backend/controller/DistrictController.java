package com.backend.controller;

import com.backend.service.DistrictService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/districts")
public class DistrictController {

    @Autowired
    private DistrictService districtService;

    @PostMapping("/upload")
    public String uploadDistricts() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/District.tsv";
        try {
            districtService.loadDistricts(filePath);
            return "Districts loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading districts: " + e.getMessage();
        }
    }

    @GetMapping("/count")
    public long countDistricts() {
        return districtService.countDistricts();
    }

    @GetMapping("/years-months")
    public List<Object[]> getDistinctYearsAndMonths() {
        return districtService.getDistinctYearsAndMonths();
    }

    @GetMapping("/highest-volume")
    public List<Object[]> getHighestVolumeByCategoryAndDistrict(@RequestParam int year, @RequestParam int month) {
        return districtService.getHighestVolumeByCategoryAndDistrict(year, month);
    }

    @GetMapping("/stores-by-category-and-district")
    public List<Object[]> getStoresByCategoryAndDistrict(@RequestParam int year, @RequestParam int month,
                                                         @RequestParam String categoryName, @RequestParam int districtNumber) {
        return districtService.getStoresByCategoryAndDistrict(year, month, categoryName, districtNumber);
    }
}
