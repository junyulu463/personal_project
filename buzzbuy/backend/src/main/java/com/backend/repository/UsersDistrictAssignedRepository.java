package com.backend.repository;

import com.backend.entity.UsersDistrictAssigned;
import com.backend.entity.UsersDistrictAssignedId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsersDistrictAssignedRepository extends JpaRepository<UsersDistrictAssigned, UsersDistrictAssignedId> {
}
