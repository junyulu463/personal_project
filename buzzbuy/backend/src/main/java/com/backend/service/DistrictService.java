package com.backend.service;

import com.backend.entity.District;
import com.backend.repository.DistrictRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.List;

@Service
public class DistrictService {

    @Autowired
    private DistrictRepository districtRepository;

    public void loadDistricts(String filePath) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                District district = new District();
                district.setDistrictNumber(fields[0]);
                districtRepository.save(district);
            }
        }
    }

    public long countDistricts() {
        return districtRepository.countDistricts();
    }

    public List<Object[]> getDistinctYearsAndMonths() {
        return districtRepository.getDistinctYearsAndMonths();
    }

    public List<Object[]> getHighestVolumeByCategoryAndDistrict(int year, int month) {
        return districtRepository.getHighestVolumeByCategoryAndDistrict(year, month);
    }

    public List<Object[]> getStoresByCategoryAndDistrict(int year, int month, String categoryName, int districtNumber) {
        return districtRepository.getStoresByCategoryAndDistrict(year, month, categoryName, districtNumber);
    }
}
