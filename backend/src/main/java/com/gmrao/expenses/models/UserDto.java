package com.gmrao.expenses.models;

import java.time.LocalDate;

public record UserDto(
        Long id,
        String name,
        String email,
        String username,
        String phone,
        String gender,
        LocalDate dateOfBirth,
        int[] photo,
        String photoType
) {}
