package com.devs.devmate.reservation.space.dto;

public record ReservationSpaceCreateRequest(
        String name,
        String address,
        Double latitude,
        Double longitude,
        String externalPlaceId
) {
}
