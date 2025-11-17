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
    private String address;
    private String city;
}
