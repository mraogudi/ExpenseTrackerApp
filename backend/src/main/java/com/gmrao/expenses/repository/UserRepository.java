package com.gmrao.expenses.repository;

import com.gmrao.expenses.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    Optional<User> findByEmailOrUsernameOrPhone(String email, String username, String phone);

    Optional<User> findByPhoneAndDateOfBirth(String phone, LocalDate dob);

    boolean existsByEmailOrUsernameOrPhone(String email, String username, String phone);
}
