package com.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.client.RestTemplate;

@Controller
@RequestMapping("/api/statistics")
public class StatisticController {

    @Autowired
    private RestTemplate restTemplate;

    @PostMapping("/load")
    public void loadStatistics() {
        String baseUrl = "http://localhost:8080/api/";
        restTemplate.postForEntity(baseUrl + "manufacturers/upload", null, Void.class);
        restTemplate.postForEntity(baseUrl + "categories/upload", null, Void.class);
        restTemplate.postForEntity(baseUrl + "districts/upload", null, Void.class);
        restTemplate.postForEntity(baseUrl + "reports/upload", null, Void.class);
        restTemplate.postForEntity(baseUrl + "dates/upload", null, Void.class);
        restTemplate.postForEntity(baseUrl + "cities/upload", null, Void.class);
        restTemplate.postForEntity(baseUrl + "products/upload", null, Void.class);
        restTemplate.postForEntity(baseUrl + "stores/upload", null, Void.class);
        restTemplate.postForEntity(baseUrl + "users/upload", null, Void.class);
        restTemplate.postForEntity(baseUrl + "holidays/upload", null, Void.class);
        restTemplate.postForEntity(baseUrl + "audit-logs/upload", null, Void.class);
        restTemplate.postForEntity(baseUrl + "users-district-assigned/upload", null, Void.class);
        restTemplate.postForEntity(baseUrl + "store-product-sales/upload", null, Void.class);
        restTemplate.postForEntity(baseUrl + "product-date-discounts/upload", null, Void.class);
        restTemplate.postForEntity(baseUrl + "product-category-assigned/upload", null, Void.class);
    }
}
