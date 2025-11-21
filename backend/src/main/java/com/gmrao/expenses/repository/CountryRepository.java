package com.gmrao.expenses.repository;

import com.gmrao.expenses.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {
    @Query(
            value = "SELECT id FROM countries WHERE name = :name",
            nativeQuery = true
    )
    Long findIdByName(@Param("name") String name);

    @Query(
            value = "SELECT name FROM countries WHERE id = :id",
            nativeQuery = true
    )
    String findNameById(@Param("id") Long id);
}
