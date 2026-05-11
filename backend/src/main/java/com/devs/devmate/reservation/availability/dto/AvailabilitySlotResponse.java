package com.devs.devmate.reservation.availability.dto;

import java.time.LocalTime;

public record AvailabilitySlotResponse(
        LocalTime startTime,
        LocalTime endTime,
        boolean available,
        String reason

) {
}
