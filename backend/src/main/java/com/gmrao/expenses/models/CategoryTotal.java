package com.gmrao.expenses.models;

import com.gmrao.expenses.enums.Category;

import java.math.BigDecimal;

public record CategoryTotal(Category category, BigDecimal total) {
}
