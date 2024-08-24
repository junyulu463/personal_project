package com.backend.service;

import com.backend.entity.StoreProductSale;
import com.backend.repository.StoreProductSaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import com.backend.util.DateUtils;

@Service
public class StoreProductSaleService {

    @Autowired
    private StoreProductSaleRepository storeProductSaleRepository;

    private static final int BATCH_SIZE = 20000; // Define your batch size

    public void loadStoreProductSales(String filePath) throws IOException {
        List<StoreProductSale> storeProductSales = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;

            // Skip the header row
            reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                StoreProductSale storeProductSale = new StoreProductSale();
                storeProductSale.setStoreNumber(fields[2]);
                storeProductSale.setPID(fields[0]);
                storeProductSale.setDate(DateUtils.convertStringToSqlDate(fields[1]));
                storeProductSale.setQuantity(Integer.parseInt(fields[3]));

                storeProductSales.add(storeProductSale);

                // Check if batch is ready to be saved
                if (storeProductSales.size() == BATCH_SIZE) {
                    storeProductSaleRepository.saveAll(storeProductSales);
                    storeProductSales.clear(); // Clear the list after saving
                }
            }

            // Save any remaining store product sales that didn't fill a batch
            if (!storeProductSales.isEmpty()) {
                storeProductSaleRepository.saveAll(storeProductSales);
            }
        }
    }
    public List<Object[]> getGpsRevenueDifference(String employeeID) {
        return storeProductSaleRepository.findGpsRevenueDifference(employeeID);
    }
}
