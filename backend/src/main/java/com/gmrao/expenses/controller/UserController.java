package com.gmrao.expenses.controller;

import com.gmrao.expenses.entity.User;
import com.gmrao.expenses.models.PersonalDetailsRequest;
import com.gmrao.expenses.models.UserContactDetails;
import com.gmrao.expenses.models.UserDetailsResponse;
import com.gmrao.expenses.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((User) auth.getPrincipal()).getId();
    }

    @PostMapping("/personal")
    public ResponseEntity<String> updatePersonalDetails(@Valid @RequestBody PersonalDetailsRequest request) {
        String returnValue = userService.updatePersonalDetails(getCurrentUserId(), request);
        if (returnValue == null) {
            return new ResponseEntity<>("User Not found", HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(returnValue, HttpStatus.OK);
    }

    @PostMapping("/contact")
    public ResponseEntity<String> updateContactDetails(@Valid @RequestBody UserContactDetails request) {
        String returnValue = userService.updateContactDetails(getCurrentUserId(), request);
        if (returnValue == null) {
            return new ResponseEntity<>("User Not found", HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(returnValue, HttpStatus.OK);
    }

    @GetMapping("/update-pwd")
    public ResponseEntity<String> updatePassword(@RequestParam String oldPassword, @RequestParam String newPassword) {
        String returnValue = userService.updatePassword(getCurrentUserId(), oldPassword, newPassword);
        if (returnValue == null) {
            return new ResponseEntity<>("User Not found", HttpStatus.NOT_FOUND);
        }
        if ("Password not matched".equalsIgnoreCase(returnValue)) {
            return new ResponseEntity<>(returnValue, HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(returnValue, HttpStatus.OK);
    }

    @GetMapping("")
    public ResponseEntity<UserDetailsResponse> getUserDetails() {
        UserDetailsResponse returnValue = userService.getUserDetails(getCurrentUserId());
        if (returnValue == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(returnValue, HttpStatus.OK);
    }

    @PostMapping("/photo")
    public ResponseEntity<String> uploadPhoto(
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        userService.uploadPhoto(getCurrentUserId(), file);

        return ResponseEntity.ok().body("Photo uploaded successfully");
    }

}
