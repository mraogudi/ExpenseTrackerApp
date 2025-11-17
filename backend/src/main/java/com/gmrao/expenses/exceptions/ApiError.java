package com.gmrao.expenses.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ApiError {
    private String message;
    private int staus;
    private LocalDateTime responseTime;
    private String path;
}
