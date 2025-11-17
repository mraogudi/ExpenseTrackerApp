package com.gmrao.expenses.models;

import com.gmrao.expenses.enums.Category;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record ExpenseResponse(
        Long id, String title, String category, BigDecimal amount, LocalDate date
) {
}
