package com.gmrao.expenses.enums;

import lombok.Getter;
import lombok.Setter;

@Getter
public enum RolesEnum {
    ADMIN("ADMIN"), USER("USER");
    RolesEnum(String roleName) {
       this.roleName = roleName;
    }
    private final String roleName;
}
