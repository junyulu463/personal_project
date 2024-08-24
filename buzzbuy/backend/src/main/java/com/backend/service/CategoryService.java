package com.backend.service;

import com.backend.entity.Category;
import com.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public void loadCategories(String filePath) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                Category category = new Category();
                category.setCategoryName(fields[0]);
                categoryRepository.save(category);
            }
        }
    }

    public long countCategories() {
        return categoryRepository.countCategories();
    }

    /**
     * Fetch category product statistics.
     *
     * @return A list of category product statistics.
     */
    public List<Object[]> getCategoryProductStatistics() {
        return categoryRepository.getCategoryStatistics();
    }
    public List<Object[]> getAirConditionerStatistics(String employeeID) {
        return categoryRepository.getAirConditionerStatistics(employeeID);
    }
}
