package com.backend.service;

import com.backend.entity.Date;
import com.backend.repository.DateRepository;
import com.backend.util.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.text.SimpleDateFormat;

@Service
public class DateService {

    @Autowired
    private DateRepository dateRepository;

    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    public void loadDates(String filePath) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                Date date = new Date();
                date.setDate(DateUtils.convertStringToSqlDate(fields[0]));
                dateRepository.save(date);
            }
        }
    }
}
