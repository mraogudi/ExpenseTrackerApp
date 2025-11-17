package com.gmrao.expenses.models;

import java.time.LocalDate;

public record PersonalDetailsRequest(String fullName, LocalDate dateOfBirth, String gender, String userName,
                                     String phone, String address, String city, String email, String password) {
}
