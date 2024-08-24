package com.backend.controller;

import com.backend.entity.Holiday;
import com.backend.service.HolidayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/holidays")
public class HolidayController {

    @Autowired
    private HolidayService holidayService;

    @PostMapping("/upload")
    public String uploadHolidays() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/Holiday.tsv";
        try {
            holidayService.loadHolidays(filePath);
            return "Holidays loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading holidays: " + e.getMessage();
        }
    }

    @GetMapping("/count")
    public long countHolidays() {
        return holidayService.countHolidays();
    }

    @GetMapping("/view")
    public Map<String, String> viewHolidays() {
        return holidayService.viewHolidays();
    }

    @PostMapping("/add")
    public String addHoliday(@RequestParam String date, @RequestParam String holidayName, @RequestParam String employeeID) {
        return holidayService.addHoliday(date, holidayName, employeeID);
    }

    @GetMapping("/canAddHoliday")
    public boolean canAddHoliday(@RequestParam String employeeID) {
        return holidayService.canAddHoliday(employeeID);
    }
}
