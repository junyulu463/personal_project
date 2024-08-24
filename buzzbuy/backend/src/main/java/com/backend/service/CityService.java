package com.backend.service;

import com.backend.entity.City;
import com.backend.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.List;

@Service
public class CityService {

    @Autowired
    private CityRepository cityRepository;

    public void loadCities(String filePath) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                City city = new City();
                city.setCityName(fields[0]);
                city.setState(fields[1]);
                city.setPopulation(Integer.parseInt(fields[2]));
                cityRepository.save(city);
            }
        }
    }

    public long countCities() {
        return cityRepository.countCities();
    }

    public List<Object[]> getCitySizeRevenueStatistics() {
        return cityRepository.getCitySizeRevenueStatistics();
    }
}
