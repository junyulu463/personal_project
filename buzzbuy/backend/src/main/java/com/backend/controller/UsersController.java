package com.backend.controller;

import com.backend.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;

@RestController
@RequestMapping("/api/users")
public class UsersController {
    @Autowired
    private UsersService usersService;

    @PostMapping("/upload")
    public String uploadUsers() {
        String filePath = "backend/src/main/java/com/backend/Demo_Data/User.tsv";
        try {
            usersService.loadUsers(filePath);
            return "Users loaded successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading users: " + e.getMessage();
        }
    }

    @PostMapping("/login")
    public String login(@RequestParam String employeeID, @RequestParam String password) {
        boolean authenticated = usersService.authenticateUser(employeeID, password);
        if (authenticated) {
            return "Login successful";
        } else {
            return "Invalid credentials";
        }
    }
    @GetMapping("/details")
    public Object[] getUserDetails(@RequestParam String employeeID) {
        Object[] userDetails = usersService.getUserDetails(employeeID);
        if (userDetails != null) {
            return userDetails; // This array will contain [firstName, lastName, auditLogAccess]
        } else {
            return new String[]{"User not found"};
        }
    }
/*
    @GetMapping("/details")
    public String[] getUserDetails(@RequestParam String employeeID) {
        String[] userDetails = usersService.getUserDetails(employeeID);
        if (userDetails != null) {
            return userDetails; // This array will contain [firstName, lastName, auditLogAccess]
        } else {
            return new String[]{"User not found"};
        }
    }

 */
}
