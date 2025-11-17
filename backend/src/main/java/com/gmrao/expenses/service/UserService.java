package com.gmrao.expenses.service;

import com.gmrao.expenses.entity.*;
import com.gmrao.expenses.enums.RolesEnum;
import com.gmrao.expenses.models.*;
import com.gmrao.expenses.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RolesRepository rolesRepository;
    private final UserRoleRepository userRoleRepository;
    private final RefreshTokenRepository tokenRepository;
    private final UserDetailsRepository userDetailsRepository;

    public AuthResponse register(RegisterRequest req) {
        if (repo.existsByEmail(req.email())) {
            throw new RuntimeException("Email already registered");
        }

        Roles roles = rolesRepository.findByName(RolesEnum.USER.getRoleName());

        User user = new User();
        user.setName(req.name());
        user.setEmail(req.email());
        user.setUsername(req.email().split("@")[0]);
        user.setRole(roles);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user = repo.save(user);

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(roles);
        userRoleRepository.save(userRole);

        String token = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return new AuthResponse(token, refreshToken, user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = repo.findByEmail(req.email())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        RefreshToken refreshToken1 = new RefreshToken();
        refreshToken1.setUserId(user.getId());
        refreshToken1.setToken(token);
        refreshToken1.setRevoked(false);
        refreshToken1.setIssuedAt(jwtService.getExpiry(token));
        refreshToken1.setExpiresAt(jwtService.getIssue(token));

        tokenRepository.save(refreshToken1);

        return new AuthResponse(token, refreshToken, user);
    }

    public boolean existsByEmail(String email) {
        return repo.existsByEmail(email);
    }

    public String updatePersonalDetails(Long currentUserId, PersonalDetailsRequest personalDetailsRequest) {
        User user = repo.findById(currentUserId).orElse(null);
        if (user == null) {
            return null;
        }
        user.setName(personalDetailsRequest.fullName());
        user.setUsername(personalDetailsRequest.userName());
        repo.save(user);
        UserDetails userDetails = userDetailsRepository.findByUserId(currentUserId);
        if (userDetails == null) {
            userDetails = new UserDetails();
        }
        userDetails.setGender(personalDetailsRequest.gender());
        userDetails.setDateOfBirth(personalDetailsRequest.dateOfBirth());
        userDetails.setUserId(currentUserId);
        userDetailsRepository.save(userDetails);
        return "Personal details updated";
    }

    public String updateContactDetails(Long currentUserId, UserContactDetails userContactDetails) {
        User user = repo.findById(currentUserId).orElse(null);
        if (user == null) {
            return null;
        }
        user.setEmail(userContactDetails.email());
        repo.save(user);
        UserDetails userDetails = userDetailsRepository.findByUserId(currentUserId);
        if (userDetails == null) {
            userDetails = new UserDetails();
        }
        userDetails.setUserId(currentUserId);
        userDetails.setCity(userContactDetails.city());
        userDetails.setAddress(userContactDetails.address());
        userDetails.setPhone(userContactDetails.phone());
        userDetailsRepository.save(userDetails);
        return "Update contact details";
    }

    public String updatePassword(Long currentUserId, String oldPassword, String newPassword) {
        User user = repo.findById(currentUserId).orElse(null);
        if (user == null) {
            return null;
        }
        if (passwordEncoder.matches(user.getPasswordHash(), oldPassword)) {
            String hashed = passwordEncoder.encode(newPassword);
            user.setPasswordHash(hashed);
            repo.save(user);
        } else {
            return "Password not matched";
        }
        return "Password updated successfully";
    }

    public UserDetailsResponse getUserDetails(Long currentUserId) {
        User user = repo.findById(currentUserId).orElse(null);
        if (user == null) {
            return null;
        }
        UserDetails userDetails = userDetailsRepository.findByUserId(currentUserId);

        return UserDetailsResponse.builder()
                .userName(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getName())
                .address(userDetails != null ? userDetails.getAddress() : "")
                .city(userDetails != null ? userDetails.getCity() : "")
                .gender(userDetails != null ? userDetails.getGender() : "")
                .dateOfBirth(userDetails != null ? userDetails.getDateOfBirth() : null)
                .phone(userDetails != null ? userDetails.getPhone() : "")
                .build();
    }

    public void uploadPhoto(Long userId, MultipartFile file) throws Exception {

        User user = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPhoto(file.getBytes());
        user.setPhotoType(file.getContentType());

        repo.save(user);
    }
}
