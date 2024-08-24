package com.backend.service;

import com.backend.entity.Manufacturer;
import com.backend.repository.ManufacturerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class ManufacturerService {
    private static  final Logger logger = LoggerFactory.getLogger(ManufacturerService.class);
    @Autowired
    private ManufacturerRepository manufacturerRepository;

    public void loadManufacturers(String filePath) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                Manufacturer manufacturer = new Manufacturer();
                manufacturer.setManufacturerName(fields[0]);
                manufacturerRepository.save(manufacturer);
            }
        }
    }

    public long countManufacturers() {
        return manufacturerRepository.countManufacturers();
    }
    public List<Map<String, Object>> getManufacturerProductStatistics() {
        List<Object[]> statistics = manufacturerRepository.getManufacturerProductStatistics();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] stat : statistics) {
            Map<String, Object> manufacturerData = new HashMap<>();
            manufacturerData.put("manufacturerName", stat[0]);
            manufacturerData.put("totalProducts", stat[1]);
            manufacturerData.put("avgRetailPrice", stat[2]);
            manufacturerData.put("minRetailPrice", stat[3]);
            manufacturerData.put("maxRetailPrice", stat[4]);
            result.add(manufacturerData);
        }
        return result;
    }

    public List<Object[]> getProductsByManufacturer(String manufacturerName) {
        return manufacturerRepository.getProductsByManufacturer(manufacturerName);
    }
}
