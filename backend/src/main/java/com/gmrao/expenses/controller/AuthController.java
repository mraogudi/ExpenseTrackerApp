package com.gmrao.expenses.controller;

import com.gmrao.expenses.entity.User;
import com.gmrao.expenses.models.AuthResponse;
import com.gmrao.expenses.models.LoginRequest;
import com.gmrao.expenses.models.RegisterRequest;
import com.gmrao.expenses.service.AuthService;
import com.gmrao.expenses.service.JwtService;
import com.gmrao.expenses.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtService jwtService; // we will define
    private final AuthService tokenService;
    private final UserService userService; // existing

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        AuthResponse authResponse = userService.login(req);
        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public Map<String, String> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (!tokenService.isRefreshTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }
        User user = tokenService.getUserIdFromRefreshToKen(refreshToken);
        String newAccess = jwtService.generateAccessToken(user);
        return Map.of("accessToken", newAccess);
    }

    @GetMapping("/logout")
    public void logout(@RequestHeader("Authorization") String authHeader) {
        String accessToken = authHeader.replace("Bearer ", "");
        Long userId = jwtService.getUserId(accessToken);
        tokenService.revokeRefreshToken(userId);
        tokenService.blacklistAccessToken(accessToken);
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<String> checkEmail(@PathVariable String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(exists ? "email-exists" : "non-email-exists");
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest registerRequest) {
        AuthResponse authResponse = userService.register(registerRequest);
        return ResponseEntity.ok(authResponse);
    }

}
