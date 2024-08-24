package com.backend.controller;

import com.backend.service.DateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/dates")
public class DateController {

    @Autowired
    private DateService dateService;

    @PostMapping("/upload")
    public String uploadDates() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/Date.tsv";
        try {
            dateService.loadDates(filePath);
            return "Dates loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading dates: " + e.getMessage();
        }
    }
}
