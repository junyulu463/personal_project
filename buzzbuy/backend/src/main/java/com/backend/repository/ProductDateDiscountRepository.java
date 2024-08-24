package com.backend.repository;

import com.backend.entity.ProductDateDiscount;
import com.backend.entity.ProductDateDiscountId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductDateDiscountRepository extends JpaRepository<ProductDateDiscount, ProductDateDiscountId> {
}
