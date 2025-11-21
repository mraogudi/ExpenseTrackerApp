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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RolesRepository rolesRepository;
    private final UserRoleRepository userRoleRepository;
    private final RefreshTokenRepository tokenRepository;
    private final AddressDetailsRepository addressDetailsRepository;
    private final ResetPasswordTokenRepository passwordRepository;
    private final EmailService emailService;
    private final CountryRepository countryRepository;
    private final StateRepository stateRepository;

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
        return new AuthResponse(token, refreshToken, getUserDTo(user));
    }

    public AuthResponse login(LoginRequest req) {
        User user = repo.findByEmailOrUsernameOrPhone(req.email(), req.email(), req.email())
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

        UserDto userDto = getUserDTo(user);

        return new AuthResponse(token, refreshToken, userDto);
    }

    private UserDto getUserDTo(User user) {
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getUsername(),
                user.getPhone(),
                user.getGender(),
                user.getDateOfBirth(),
                convertBytesToNumeric(user.getPhoto()),          // <-- RAW BYTES
                user.getPhotoType()
        );
    }

    public boolean existsByEmail(String email) {
        return repo.existsByEmailOrUsernameOrPhone(email, email, email);
    }

    public String updatePersonalDetails(Long currentUserId, PersonalDetailsRequest personalDetailsRequest) {
        User user = repo.findById(currentUserId).orElse(null);
        if (user == null) {
            return null;
        }
        user.setName(personalDetailsRequest.fullName());
        user.setUsername(personalDetailsRequest.userName());
        user.setGender(personalDetailsRequest.gender());
        user.setDateOfBirth(personalDetailsRequest.dateOfBirth());
        user.setPhone(personalDetailsRequest.phone());
        user.setEmail(personalDetailsRequest.email());
        repo.save(user);
        return "Personal details updated";
    }

    public String updateContactDetails(Long currentUserId, UserContactDetails userContactDetails) {
        AddressDetails addressDetails = addressDetailsRepository.findByUserId(currentUserId);
        if (addressDetails == null) {
            addressDetails = new AddressDetails();
        }
        String country = countryRepository.findById(userContactDetails.country()).get().getName();
        String state = stateRepository.findById(userContactDetails.state()).get().getName();
        addressDetails.setUserId(currentUserId);
        addressDetails.setCity(userContactDetails.city());
        addressDetails.setAddressLine1(userContactDetails.addressLine1());
        addressDetails.setAddressLine2(userContactDetails.addressLine2());
        addressDetails.setPincode(userContactDetails.pincode());
        addressDetails.setCountry(country);
        addressDetails.setState(state);
        addressDetailsRepository.save(addressDetails);
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
        Long countryId = 0L, stateId = 0L;
        AddressDetails addressDetails = addressDetailsRepository.findByUserId(currentUserId);
        if (addressDetails == null) {
            addressDetails = new AddressDetails();
        } else {
            countryId = countryRepository.findIdByName(addressDetails.getCountry());
            stateId = stateRepository.findIdByName(addressDetails.getState());
        }

        int[] numeric = convertBytesToNumeric(user.getPhoto());

        byte[] bytes = user.getPhoto();

        for (int i = 0; i < bytes.length; i++) {
            numeric[i] = bytes[i] & 0xFF;  // convert signed byte → 0-255
        }

        return UserDetailsResponse.builder()
                .userName(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getName())
                .addressLine1(addressDetails.getAddressLine1() != null ? addressDetails.getAddressLine1() : "")
                .addressLine2(addressDetails.getAddressLine2() != null ? addressDetails.getAddressLine2() : "")
                .city(addressDetails.getCity() != null ? addressDetails.getCity() : "")
                .gender(user.getGender() != null ? user.getGender() : "")
                .dateOfBirth(user.getDateOfBirth() != null ? user.getDateOfBirth() : null)
                .phone(user.getPhone() != null ? user.getPhone() : "")
                .country((addressDetails.getCountry() != null) ? addressDetails.getCountry() : null)
                .state(addressDetails.getState() != null ? addressDetails.getState() : null)
                .pincode(addressDetails.getPincode() != null ? addressDetails.getPincode() : "")
                .photo(numeric)
                .countryId(countryId)
                .stateId(stateId)
                .build();
    }

    private int[] convertBytesToNumeric(byte[] photo) {
        int[] numeric = new int[photo.length];

        for (int i = 0; i < photo.length; i++) {
            numeric[i] = photo[i] & 0xFF;  // convert signed byte → 0-255
        }
        return numeric;
    }

    public void uploadPhoto(Long userId, MultipartFile file) throws Exception {

        User user = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPhoto(file.getBytes());
        user.setPhotoType(file.getContentType());

        repo.save(user);
    }

    public Map<String, String> forgotPassword(String email) {
        String token = UUID.randomUUID().toString();

        // save token with expiry
        PasswordResetTokens resetToken = new PasswordResetTokens();
        resetToken.setEmail(email);
        resetToken.setToken(token);
        resetToken.setCreatedAt(LocalDateTime.now());
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        passwordRepository.save(resetToken);

        emailService.sendMail(email, "Reset Password", token);
        return Map.of("message", "Reset email sent");
    }

    public Map<String, String> resetPassword(ResetPasswordRequest req) {
        PasswordResetTokens token = passwordRepository.findByToken(req.token())
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = repo.findByEmail(token.getEmail()).get();
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        repo.save(user);

        passwordRepository.delete(token);

        return Map.of("message", "Password reset successful");
    }

    public Map<String, String> recoverUserNameOrEmail(RecoverUserDetails request) {
        User user = repo.findByPhoneAndDateOfBirth(request.phoneNumber(), request.dob())
                .orElseThrow(() -> new RuntimeException("User not found with details"));
        return Map.of("message", "Mail: "+user.getEmail()+" and Username: "+user.getUsername());
    }

    public List<States> getStateList(Long countryId) {
        List<State> statesList = stateRepository.findByCountryId(countryId);
        List<States> returnList = new ArrayList<>();
        for (State state : statesList) {
            States states = new States(state.getId(), state.getName());
            returnList.add(states);
        }
        return returnList;
    }

    public List<Countries> getCountryList() {
        List<Country> countries = countryRepository.findAll();
        List<Countries> returnList = new ArrayList<>();
        for (Country country : countries) {
            Countries county = new Countries(country.getId(), country.getName());
            returnList.add(county);
        }
        return returnList;
    }

    public void deletePhoto(Long userId) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPhoto(null);
        user.setPhotoType(null);

        repo.save(user);
    }
}
