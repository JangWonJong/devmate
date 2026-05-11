package com.devs.devmate.reservation.command.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationWithPlaceRequest(
        Long reservationSpaceId,
        String placeName,
        String address,
        Double latitude,
        Double longitude,
        String externalPlaceId,
        String placeDetail,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String title
) {
}
