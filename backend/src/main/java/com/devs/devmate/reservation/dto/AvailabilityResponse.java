package com.devs.devmate.reservation.dto;

import java.time.LocalDate;
import java.util.List;

public record AvailabilityResponse(
        Long roomId,
        LocalDate date,
        List<AvailabilitySlotResponse> slots
) {
}
