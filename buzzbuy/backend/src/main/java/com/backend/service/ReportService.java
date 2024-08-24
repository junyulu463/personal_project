package com.backend.service;

import com.backend.entity.Report;
import com.backend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public void loadReports(String filePath) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                Report report = new Report();
                report.setReportName(fields[0]);
                reportRepository.save(report);
            }
        }
    }
}
