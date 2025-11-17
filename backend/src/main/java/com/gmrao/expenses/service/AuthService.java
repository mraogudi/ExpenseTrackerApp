package com.gmrao.expenses.service;

import com.gmrao.expenses.entity.BlacklistedToken;
import com.gmrao.expenses.entity.RefreshToken;
import com.gmrao.expenses.entity.User;
import com.gmrao.expenses.repository.BlacklistedTokenRepository;
import com.gmrao.expenses.repository.RefreshTokenRepository;
import com.gmrao.expenses.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final RefreshTokenRepository refreshRepo;
    private final BlacklistedTokenRepository blacklistRepo;
    private final UserRepository userRepo;
    private final JwtService jwtService; // we will define

    // Generate new refresh token and replace old one
    public String issueRefreshToken(Long userId) {
        refreshRepo.findByUserId(userId).ifPresent(refreshRepo::delete);

        String token = UUID.randomUUID().toString();
        RefreshToken refresh = RefreshToken.builder()
                .userId(userId)
                .token(token)
                .issuedAt(OffsetDateTime.now())
                .expiresAt(OffsetDateTime.now().plusDays(30))
                .build();
        refreshRepo.save(refresh);
        return token;
    }

    public boolean isRefreshTokenValid(String token) {
        return refreshRepo.findByToken(token)
                .filter(rt -> !rt.isRevoked() && rt.getExpiresAt().isAfter(OffsetDateTime.now()))
                .isPresent();
    }

    public User getUserIdFromRefreshToKen(String token) {
        Optional<RefreshToken> refreshToken = refreshRepo.findByToken(token);
        if (refreshToken.isPresent()) {
            return userRepo.findById(refreshToken.get().getUserId()).get();
        }
        return null;
    }

    public void revokeRefreshToken(Long userId) {
        List<RefreshToken> refreshTokens = refreshRepo.findByUserIdAndRevoked(userId, false);
        refreshTokens.forEach(refreshToken -> {
            refreshToken.setRevoked(true);
        });
        refreshRepo.saveAll(refreshTokens);
    }

    public void blacklistAccessToken(String token) {
        blacklistRepo.save(BlacklistedToken.builder()
                .token(token)
                .userId(jwtService.getUserId(token))
                .expiresAt(jwtService.getExpiry(token))
                .blacklistedAt(OffsetDateTime.now())
                .build());
    }

    public boolean isAccessTokenBlacklisted(String token) {
        return blacklistRepo.existsByToken(token);
    }
}
