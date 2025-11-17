package com.gmrao.expenses.repository;

import com.gmrao.expenses.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByUserId(Long userId);
    List<RefreshToken> findByUserIdAndRevoked(Long userId, boolean revoked);
    Optional<RefreshToken> findByToken(String token);
}
