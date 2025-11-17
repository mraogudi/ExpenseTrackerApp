package com.gmrao.expenses.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

@Getter
@AllArgsConstructor
public enum Category {
    GENERAL("General"), FOOD("Food"), TRANSPORT("Transport"), UTILITIES("Utilities"), ENTERTAINMENT("Entertainment"), HEALTH("Health"), OTHER("Other");

    private String category;

    public static Category getCategory(String category) {
        return Arrays.stream(Category.values())
                .filter(cate -> cate.getCategory().equals(category))
                .findFirst()
                .orElse(null);
    }

}
