package com.gmrao.expenses.repository;

import com.gmrao.expenses.entity.Expense;
import org.springframework.data.jpa.repository.*;

import java.util.List;
import java.util.Map;

public interface ExpenseRepository extends JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {

    List<Expense> findByUserId(Long userId);

    // Monthly totals (for Pie Chart)
    @Query(value = """
        SELECT DATE_FORMAT(e.expense_date, '%b') AS month,
               SUM(e.amount) AS total
        FROM expenses e
        WHERE e.user_id = :userId
        GROUP BY DATE_FORMAT(e.expense_date, '%b'), MONTH(e.expense_date)
        ORDER BY MONTH(e.expense_date)
    """, nativeQuery = true)
    List<Map<String, Object>> getMonthlyTotals(Long userId);


    // Category totals (for Line Chart)
    @Query(value = """
        SELECT e.category AS category,
               SUM(e.amount) AS amount
        FROM expenses e
        WHERE e.user_id = :userId
        GROUP BY e.category
        ORDER BY amount DESC
    """, nativeQuery = true)
    List<Map<String, Object>> getCategoryTotals(Long userId);


    // Total spent (Summary Card 1)
    @Query(value = """
        SELECT SUM(e.amount)
        FROM expenses e
        WHERE e.user_id = :userId
    """, nativeQuery = true)
    Double totalSpent(Long userId);


    // Highest spent category (Summary Card 2)
    @Query(value = """
        SELECT e.category AS category,
               SUM(e.amount) AS total
        FROM expenses e
        WHERE e.user_id = :userId
        GROUP BY e.category
        ORDER BY total DESC
        LIMIT 1
    """, nativeQuery = true)
    Map<String, Object> highestCategory(Long userId);


    // Average monthly spend (Summary Card 3)
    @Query(value = """
        SELECT AVG(month_totals.month_total)
        FROM (
            SELECT SUM(e.amount) AS month_total
            FROM expenses e
            WHERE e.user_id = :userId
            GROUP BY DATE_FORMAT(e.expense_date, '%Y-%m')
        ) AS month_totals
    """, nativeQuery = true)
    Double avgMonthly(Long userId);

}
