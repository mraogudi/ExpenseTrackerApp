package com.gmrao.expenses.models;

import lombok.*;

import java.time.LocalDate;

@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailsResponse {
    private String fullName;
    private String userName;
    private String email;
    private LocalDate dateOfBirth;
    private String gender;
    private String phone;
    private String addressLine1;
    private String addressLine2;
    private String country;
    private String state;
    private String city;
    private String pincode;

    private int[] photo;      // RAW BYTES (UI will convert to Blob)
    private String photoType;  // MIME type like image/jpeg

    private Long countryId;
    private Long stateId;
}
