import apiService from "./apiService";

const expenseService = {
  getExpenses: (userId, params = {}) =>
    apiService.get(`/expenses/list`, { params: { userId, ...params } }),

  createExpense: (expense) =>
    apiService.post(`/expenses/add`, expense, { successMessage: "Expense added!" }),

  updateExpense: (id, expense) =>
    apiService.put(`/expenses/${id}`, expense, { successMessage: "Expense updated!" }),

  deleteExpense: (id) =>
    apiService.delete(`/expenses/${id}`, { successMessage: "Expense deleted!" }),

  fetchExpense: (id) =>
    apiService.get(`/expenses/${id}`, { successMessage: "Expense Fetched!" }),

  getSummary: (userId) => apiService.get("/expenses/summary", { params: { userId } }),
  exportData: () => apiService.get("/expenses/export"),
  getMonthlyExpenses: (userId) =>
    apiService.get("/expenses/monthly", { params: { userId } }),
  getCategoryExpenses: (userId) =>
    apiService.get("/expenses/categories", { params: { userId } }),

};

export default expenseService;
