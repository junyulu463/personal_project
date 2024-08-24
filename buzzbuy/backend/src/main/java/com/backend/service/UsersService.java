package com.backend.service;

import com.backend.controller.UsersController;
import com.backend.entity.Users;
import com.backend.repository.UsersRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.Optional;

@Service
public class UsersService {
    private static final Logger logger = LoggerFactory.getLogger(UsersController.class);
    @Autowired
    private UsersRepository usersRepository;

    public void loadUsers(String filePath) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                Users user = new Users();
                user.setEmployeeID(fields[0]);
                user.setLast4DigitsSSN(fields[3]);
                user.setFirstName(fields[1]);
                user.setLastName(fields[2]);
                user.setAuditLogAccess(fields[4].equals("1"));
                usersRepository.save(user);
            }
        }
    }
    public boolean authenticateUser(String employeeID, String providedPassword) {
        String truePassword = usersRepository.findTruePasswordByEmployeeID(employeeID);
        return truePassword != null && truePassword.equals(providedPassword);
    }

    public Object[] getUserDetails(String employeeID) {
        Optional<Object> detailsOpt = usersRepository.findUserDetailsByEmployeeID(employeeID);
        if (detailsOpt.isPresent()) {
            Object[] details = (Object[]) detailsOpt.get();  // Cast to Object[]
            if (details.length == 3) {
                return details;
            } else {
                throw new IllegalStateException("Unexpected result array length: " + details.length);
            }
        }
        return null;
    }
/*
    public String[] getUserDetails(String employeeID) {
        Optional<Object> detailsOpt = usersRepository.findUserDetailsByEmployeeID(employeeID);
        if (detailsOpt.isPresent()) {
            Object[] details = (Object[]) detailsOpt.get();  // Cast to Object[]
            if (details.length == 3) {
                return new String[]{details[0].toString(), details[1].toString(), details[2].toString()};
            } else {
                throw new IllegalStateException("Unexpected result array length: " + details.length);
            }
        }
        return null;
    }

 */
}
