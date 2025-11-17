// src/main/java/com/gmrao/expenses/expense/ExpenseController.java
package com.gmrao.expenses.controller;

import com.gmrao.expenses.entity.Expense;
import com.gmrao.expenses.entity.User;
import com.gmrao.expenses.models.*;
import com.gmrao.expenses.service.ExpenseService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {
    private final ExpenseService service;

    // TODO: Replace with actual JWT extraction
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((User) auth.getPrincipal()).getId();
    }

    @GetMapping("/list")
    public ResponseEntity<List<ExpenseResponse>> list() {
        return new ResponseEntity<>(service.list(getCurrentUserId()), HttpStatus.OK);
    }

    @PostMapping("/add")
    public ExpenseResponse create(@RequestBody @Valid ExpenseRequest req) {
        return service.create(getCurrentUserId(), req);
    }

    @PutMapping("/{id}")
    public ExpenseResponse update(@PathVariable Long id, @RequestBody @Valid ExpenseRequest req) {
        return service.update(getCurrentUserId(), id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(getCurrentUserId(), id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> fetch(@PathVariable Long id) {
        return new ResponseEntity<>(service.fetch(id), HttpStatus.OK);
    }

    @GetMapping("/monthly")
    public List<Map<String, Object>> getMonthlyTotals() {
        List<Map<String, Object>> mapList = service.getMonthlyTotals(getCurrentUserId());
        System.out.println("Map List :: " + mapList.size());
        return mapList;
    }

    @GetMapping("/categories")
    public List<Map<String, Object>> getCategoryTotals() {
        return service.getCategoryTotals(getCurrentUserId());
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        return service.getSummary(getCurrentUserId());
    }

    @GetMapping(value = "/export", produces = "text/csv")
    public void exportCSV(HttpServletResponse response) throws IOException {
        List<Expense> expenses = service.exportCSV(getCurrentUserId());

        response.setHeader("Content-Disposition", "attachment; filename=expenses.csv");
        response.setContentType("text/csv");

        PrintWriter writer = response.getWriter();
        writer.println("Date,Title,Category,Amount");
        for (Expense e : expenses) {
            writer.println(e.getDate() + "," + e.getTitle() + "," + e.getCategory() + "," + e.getAmount());
        }
        writer.flush();
    }


}
