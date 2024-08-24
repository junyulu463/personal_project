package com.backend.controller;

import com.backend.service.UsersDistrictAssignedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/users-district-assigned")
public class UsersDistrictAssignedController {

    @Autowired
    private UsersDistrictAssignedService usersDistrictAssignedService;

    @PostMapping("/upload")
    public String uploadUsersDistrictAssigned() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/User.tsv";
        try {
            usersDistrictAssignedService.loadUsersDistrictAssigned(filePath);
            return "Users district assignments loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading users district assignments: " + e.getMessage();
        }
    }
}
