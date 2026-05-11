package com.devs.devmate.reservation.space.dto;

import com.devs.devmate.reservation.space.entity.ReservationSpace;

public record ReservationSpaceResponse(
        Long id,
        String name,
        String address,
        Double latitude,
        Double longitude,
        String providerType,
        String providerName
) {
    public static ReservationSpaceResponse from(ReservationSpace space) {
        return new ReservationSpaceResponse(
                space.getId(),
                space.getName(),
                space.getAddress(),
                space.getLatitude(),
                space.getLongitude(),
                space.getProviderType().name(),
                space.getProviderName() == null ? null : space.getProviderName().name()
        );
    }
}
