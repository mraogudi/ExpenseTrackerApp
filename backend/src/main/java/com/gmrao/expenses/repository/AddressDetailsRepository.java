package com.gmrao.expenses.repository;

import com.gmrao.expenses.entity.AddressDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressDetailsRepository extends JpaRepository<AddressDetails, Long> {
    AddressDetails findByUserId(Long currentUserId);
}
