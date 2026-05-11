package com.devs.devmate.reservation.space.entity;

import com.devs.devmate.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "reservation_spaces")
public class ReservationSpace extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 255)
    private String address;

    private Double latitude;

    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReservationSpaceType providerType;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ReservationSpaceProvider providerName;

    @Column(length = 100)
    private String externalPlaceId;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
