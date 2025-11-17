package com.gmrao.expenses.service;

import com.gmrao.expenses.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

// JwtService.java
@Component
public class JwtService {

    private final String jetSecret = "AiiyGrETpY34gbiRyLyljC8yp7iR8g58gVo3qCnHkm0ArxDNxBMN4BjKJjU4ZNoGX9OUHOTT1kq7vW7e+7U/bg==";

    private final long ACCESS_TTL_MS = 15 * 60 * 10 * 1000L;   // 15 minutes
    private final long REFRESH_TTL_MS = 7L * 24 * 60 * 60 * 1000; // 7 days

    public String generateAccessToken(User u) {
        String jti = UUID.randomUUID().toString();
        return Jwts.builder()
                .setSubject(u.getId().toString())
                .setId(jti)
                .claim("email", u.getEmail())
                .claim("roles", u.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TTL_MS))
                .signWith(Keys.hmacShaKeyFor(jetSecret.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(User u) {
        String jti = UUID.randomUUID().toString();
        return Jwts.builder()
                .setSubject(u.getId().toString())
                .setId(jti)
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TTL_MS))
                .signWith(Keys.hmacShaKeyFor(jetSecret.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(jetSecret.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Long getUserId(String token) {
        String tokenId = parse(token).getSubject();
        return Long.parseLong(tokenId);
    }
    public String getJti(String token) { return parse(token).getId(); }
    public OffsetDateTime getExpiry(String token) {
        Date date = parse(token).getExpiration();
        Instant instant = date.toInstant();
        return OffsetDateTime.ofInstant(instant, ZoneId.systemDefault());
    }

    public OffsetDateTime getIssue(String token) {
        Date date = parse(token).getIssuedAt();
        Instant instant = date.toInstant();
        return OffsetDateTime.ofInstant(instant, ZoneId.systemDefault());
    }
}
