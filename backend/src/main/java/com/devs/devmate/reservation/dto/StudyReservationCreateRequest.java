package com.devs.devmate.reservation.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record StudyReservationCreateRequest(
        @NotNull Long roomId,
        @NotNull LocalDate date,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime
        ) {
}
