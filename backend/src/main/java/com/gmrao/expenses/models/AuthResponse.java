package com.gmrao.expenses.models;

import com.gmrao.expenses.entity.User;

public record AuthResponse(String token, String refreshToken, User user) {
}
