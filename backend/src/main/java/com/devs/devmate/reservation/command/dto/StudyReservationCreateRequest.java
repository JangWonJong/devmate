package com.devs.devmate.reservation.command.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record StudyReservationCreateRequest(
        @NotNull Long reservationSpaceId,
        @NotNull LocalDate date,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        String placeDetail
        ) {
}
