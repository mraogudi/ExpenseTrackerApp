package com.gmrao.expenses.models;

import java.util.List;

public record PageResponse<E>(
        List<ExpenseResponse> items,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
