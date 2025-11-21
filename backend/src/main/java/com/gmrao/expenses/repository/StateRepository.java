package com.gmrao.expenses.repository;

import com.gmrao.expenses.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StateRepository extends JpaRepository<State, Long> {
    List<State> findByCountryId(Long countryId);
    @Query(
            value = "SELECT id FROM states WHERE name = :name",
            nativeQuery = true
    )
    Long findIdByName(@Param("name") String name);

    @Query(
            value = "SELECT name FROM states WHERE id = :id",
            nativeQuery = true
    )
    String findNameById(@Param("id") Long id);
}
