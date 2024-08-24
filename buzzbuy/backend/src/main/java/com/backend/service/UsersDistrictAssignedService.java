package com.backend.service;

import com.backend.entity.UsersDistrictAssigned;
import com.backend.repository.UsersDistrictAssignedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

@Service
public class UsersDistrictAssignedService {

    @Autowired
    private UsersDistrictAssignedRepository usersDistrictAssignedRepository;

    public void loadUsersDistrictAssigned(String filePath) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                String employeeID = fields[0];
                String districtNumbers = fields[5];

                // Split the districtNumbers by comma and trim any whitespace
                String[] districtArray = districtNumbers.split(",");

                for (String district : districtArray) {
                    UsersDistrictAssigned usersDistrictAssigned = new UsersDistrictAssigned();
                    usersDistrictAssigned.setDistrictNumber(district.trim());
                    usersDistrictAssigned.setEmployeeID(employeeID);
                    usersDistrictAssignedRepository.save(usersDistrictAssigned);
                }
            }
        }
    }
}
