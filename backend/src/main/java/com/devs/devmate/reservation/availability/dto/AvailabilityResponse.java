package com.devs.devmate.reservation.availability.dto;

import java.time.LocalDate;
import java.util.List;

public record AvailabilityResponse(
        Long reservationSpaceId,
        LocalDate date,
        List<AvailabilitySlotResponse> slots
) {
}
