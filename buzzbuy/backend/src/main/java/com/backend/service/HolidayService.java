package com.backend.service;

import com.backend.entity.Holiday;
import com.backend.repository.HolidayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import com.backend.util.DateUtils;

@Service
public class HolidayService {
    private static final Logger logger = LoggerFactory.getLogger(HolidayService.class);
    @Autowired
    private HolidayRepository holidayRepository;

    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    public void loadHolidays(String filePath) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                Holiday holiday = new Holiday();
                holiday.setDate(DateUtils.convertStringToSqlDate(fields[0]));
                holiday.setHolidayName(fields[1]);
                holiday.setEmployeeID(fields[2]);
                holidayRepository.save(holiday);
            }
        }
    }
    public long countHolidays() {
        return holidayRepository.countHolidays();
    }

    public Map<String, String> viewHolidays() {
        List<Holiday> holidays = holidayRepository.findAll();
        Map<String, String> holidayMap = new HashMap<>();
        for (Holiday holiday : holidays) {
            holidayMap.put(holiday.getDate().toString(), holiday.getHolidayName());
        }
        return holidayMap;
    }

    public boolean canAddHoliday(String employeeID) {
        int userTotalDistricts = holidayRepository.countUserAssignedDistricts(employeeID);
        int totalDistricts = holidayRepository.countTotalDistricts();
        return userTotalDistricts == totalDistricts;
    }

    public String addHoliday(String dateStr, String holidayName, String employeeID) {
        // Validate date string
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return "Invalid date. Please provide a valid date.";
        }

        // Validate holiday name
        if (holidayName == null || holidayName.trim().isEmpty()) {
            return "Invalid holiday name. Please provide a valid holiday name.";
        }

        // Convert date string to java.sql.Date
        java.sql.Date date;
        try {
            date = DateUtils.convertStringToSqlDate(dateStr);
        } catch (IllegalArgumentException e) {
            return "Invalid date format. Please use yyyy-MM-dd.";
        }

        // Check if holiday already exists for this date
        if (holidayRepository.countHolidaysByDate(date) > 0) {
            return "Holiday already exists for this date.";
        }

        // Create and save the holiday
        Holiday holiday = new Holiday();
        holiday.setDate(date);
        holiday.setHolidayName(holidayName);
        holiday.setEmployeeID(employeeID);

        holidayRepository.save(holiday);
        return "Holiday added successfully";
    }
}
