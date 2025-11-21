package com.gmrao.expenses.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "address_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "address_line_2")
    private String addressLine2;

    // Contact details
    private String state;
    @Column(name = "address_line_1")
    private String addressLine1;
    private String city;
    private Long userId;
    private String pincode;
    private String country;
}
