package com.gmrao.expenses.models;

public record ResetPasswordRequest(String token, String newPassword) {
}
