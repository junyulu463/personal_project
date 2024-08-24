package com.backend.service;

import com.backend.entity.Store;
import com.backend.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.List;

@Service
public class StoreService {

    @Autowired
    private StoreRepository storeRepository;

    public void loadStores(String filePath) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                Store store = new Store();
                store.setStoreNumber(fields[0]);
                store.setPhoneNumber(fields[1]);
                store.setCityName(fields[2]);
                store.setState(fields[3]);
                store.setDistrictNumber(fields[4]);
                storeRepository.save(store);
            }
        }
    }

    public long countStores() {
        return storeRepository.countStores();
    }

    // Fetch distinct states
    public List<String> getDistinctStates() {
        return storeRepository.getDistinctStates();
    }

    // Fetch store revenue by state and year
    public List<Object[]> getStoreRevenueByState(String state) {
        return storeRepository.getStoreRevenueByState(state);
    }
}
