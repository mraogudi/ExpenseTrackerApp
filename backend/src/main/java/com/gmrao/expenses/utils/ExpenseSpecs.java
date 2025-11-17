// src/main/java/com/gmrao/expenses/expense/ExpenseSpecs.java
package com.gmrao.expenses.utils;

import com.gmrao.expenses.entity.Expense;
import com.gmrao.expenses.enums.Category;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDate;

public class ExpenseSpecs {
    public static Specification<Expense> belongsTo(Long userId) {
        return (root, q, cb) -> cb.equal(root.get("userId"), userId);
    }
    public static Specification<Expense> categoryIs(Category c) {
        return (root, q, cb) -> c == null ? cb.conjunction() : cb.equal(root.get("category"), c);
    }
    public static Specification<Expense> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get("date"), from);
    }
    public static Specification<Expense> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("date"), to);
    }
}
