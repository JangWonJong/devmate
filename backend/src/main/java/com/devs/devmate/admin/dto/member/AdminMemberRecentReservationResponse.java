package com.devs.devmate.admin.dto.member;

import com.devs.devmate.reservation.entity.Reservation;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class AdminMemberRecentReservationResponse {

    private Long id;
    private String title;
    private String roomName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Reservation.Status status;

    public static AdminMemberRecentReservationResponse from(Reservation reservation) {
        return AdminMemberRecentReservationResponse.builder()
                .id(reservation.getId())
                .title(reservation.getTitle())
                .roomName(reservation.getRoom().getName())
                .date(reservation.getDate())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .status(reservation.getStatus())
                .build();
    }

}
