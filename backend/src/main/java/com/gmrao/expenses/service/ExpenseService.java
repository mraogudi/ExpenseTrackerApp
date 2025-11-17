// src/main/java/com/gmrao/expenses/expense/ExpenseService.java
package com.gmrao.expenses.service;

import com.gmrao.expenses.entity.Expense;
import com.gmrao.expenses.enums.Category;
import com.gmrao.expenses.models.*;
import com.gmrao.expenses.repository.ExpenseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    private final ExpenseRepository repo;

    public List<ExpenseResponse> list(Long userId) {
        List<Expense> page = repo.findByUserId(userId);
        page.sort(Comparator.comparing(Expense::getCreatedAt).reversed());
        return page.stream().map(this::toResp).toList();
    }

    public ExpenseResponse create(Long userId, ExpenseRequest req) {
        Expense e = new Expense();
        e.setUserId(userId);
        e.setTitle(req.title());
        e.setCategory(Category.getCategory(req.category()));
        e.setAmount(req.amount());
        e.setDate(req.date());
        e = repo.save(e);
        return toResp(e);
    }

    public ExpenseResponse update(Long userId, Long id, ExpenseRequest req) {
        Expense e = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Expense not found"));
        if (!e.getUserId().equals(userId)) throw new EntityNotFoundException("Expense not found");
        e.setTitle(req.title());
        e.setCategory(Category.getCategory(req.category()));
        e.setAmount(req.amount());
        e.setDate(req.date());
        return toResp(repo.save(e));
    }

    public void delete(Long userId, Long id) {
        Expense e = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Expense not found"));
        if (!e.getUserId().equals(userId)) throw new EntityNotFoundException("Expense not found");
        repo.delete(e);
    }

    private ExpenseResponse toResp(Expense e) {
        return new ExpenseResponse(e.getId(), e.getTitle(), e.getCategory().getCategory(), e.getAmount(), e.getDate());
    }

    public List<Map<String, Object>> getMonthlyTotals(Long userId) {
        return repo.getMonthlyTotals(userId);
    }

    public List<Map<String, Object>> getCategoryTotals(Long userId) {
        return repo.getCategoryTotals(userId);
    }

    public Map<String, Object> getSummary(Long userId) {
        Double totalSpent = repo.totalSpent(userId);
        Map<String, Object> highestCategory = repo.highestCategory(userId);
        Double avgMonthly = repo.avgMonthly(userId);

        return Map.of(
                "totalSpent", totalSpent,
                "highestCategory", highestCategory,
                "avgMonthly", avgMonthly
        );
    }

    public List<Expense> exportCSV(Long userId) {
        return repo.findByUserId(userId);
    }

    public ExpenseResponse fetch(Long id) {
        Expense expense = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found or unauthorized"));
        return toResp(expense);
    }

}
