package com.backend.controller;

import com.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping("/upload")
    public String uploadReports() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/Report_Names.tsv";
        try {
            reportService.loadReports(filePath);
            return "Reports loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading reports: " + e.getMessage();
        }
    }
}
