package com.gmrao.expenses.repository;

import com.gmrao.expenses.entity.PasswordResetTokens;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResetPasswordTokenRepository extends JpaRepository<PasswordResetTokens, Long> {
    Optional<PasswordResetTokens> findByToken(String token);
}
