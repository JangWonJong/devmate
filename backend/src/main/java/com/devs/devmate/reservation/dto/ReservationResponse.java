package com.devs.devmate.reservation.dto;


import com.devs.devmate.reservation.entity.Reservation;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationResponse(
        Long id,
        Long roomId,
        String roomName,
        Long memberId,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String title,
        String status
) {
    public static ReservationResponse from(Reservation r) {
        return new ReservationResponse(
                r.getId(),
                r.getRoom().getId(),
                r.getRoom().getName(),
                r.getMember().getId(),
                r.getDate(),
                r.getStartTime(),
                r.getEndTime(),
                r.getTitle(),
                r.getStatus().name()
        );
    }
}
