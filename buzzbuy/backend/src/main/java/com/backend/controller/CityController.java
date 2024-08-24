package com.backend.controller;

import com.backend.service.CityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/cities")
public class CityController {

    @Autowired
    private CityService cityService;

    @GetMapping("/hello")
    public  String test() {
        return "hello.dasdasdas";
    }

    @PostMapping("/upload")
    public String uploadCities() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/City.tsv";
        try {
            cityService.loadCities(filePath);
            return "Cities loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading cities: " + e.getMessage();
        }
    }

    @GetMapping("/count")
    public long countCities() {
        return cityService.countCities();
    }

    @GetMapping("/city-size-revenue-statistics")
    public List<Object[]> getCitySizeRevenueStatistics() {
        return cityService.getCitySizeRevenueStatistics();
    }
}
