package com.gmrao.expenses.models;

import com.gmrao.expenses.enums.Category;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        @NotBlank String title,
        @NotNull String category,
        @NotNull @DecimalMin("0.0") BigDecimal amount,
        @NotNull LocalDate date
) {
}
