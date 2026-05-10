package com.devs.devmate.reservation.service;


import com.devs.devmate.reservation.entity.Reservation;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
public class ReservationAvailabilityEvaluator {

    public AvailabilityEvaluationResult evaluate(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            List<Reservation> spaceReservations,
            List<Reservation> myReservations
    ) {
        if (isPastTime(date, startTime)) {
            return AvailabilityEvaluationResult.fail("PAST_TIME");
        }

        if (hasConflict(startTime, endTime, spaceReservations)) {
            return AvailabilityEvaluationResult.fail("ALREADY_RESERVED");
        }

        if (hasConflict(startTime, endTime, myReservations)) {
            return AvailabilityEvaluationResult.fail("MY_CONFLICT");
        }

        if (isDailyCountLimitExceeded(myReservations)) {
            return AvailabilityEvaluationResult.fail("DAILY_COUNT_LIMIT");
        }

        return AvailabilityEvaluationResult.success();
    }

    private boolean isPastTime(LocalDate date, LocalTime startTime) {
        return LocalDateTime.of(date, startTime).isBefore(LocalDateTime.now());
    }

    private boolean hasConflict(LocalTime startTime, LocalTime endTime, List<Reservation> reservations) {
        return reservations.stream()
                .anyMatch(reservation ->
                        startTime.isBefore(reservation.getEndTime()) &&
                                endTime.isAfter(reservation.getStartTime())
                );
    }

    private boolean isDailyCountLimitExceeded(List<Reservation> myReservations) {
        return myReservations.size() >= 3;
    }
}
