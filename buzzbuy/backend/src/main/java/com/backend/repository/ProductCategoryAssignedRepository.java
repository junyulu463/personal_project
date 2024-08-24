package com.backend.repository;

import com.backend.entity.ProductCategoryAssigned;
import com.backend.entity.ProductCategoryAssignedId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ProductCategoryAssignedRepository extends JpaRepository<ProductCategoryAssigned, ProductCategoryAssignedId> {
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO product_category_assigned (pid, category_name) VALUES (:pid, :categoryName)", nativeQuery = true)
    void insertProductCategoryAssigned(String pid, String categoryName);
}
