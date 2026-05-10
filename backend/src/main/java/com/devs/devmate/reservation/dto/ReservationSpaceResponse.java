package com.devs.devmate.reservation.dto;

public record ReservationSpaceResponse(
        Long id,
        String name,
        String address,
        Double latitude,
        Double longitude,
        String providerType
) {
}
