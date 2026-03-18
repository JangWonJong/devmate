package com.devs.devmate.reservation.dto;


import com.devs.devmate.reservation.entity.Reservation;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationResponse(
        Long id,
        Long roomId,
        String roomName,
        Long memberId,
        String memberNickname,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String title,
        String status,
        Long studyId,
        Long postId
) {
    public static ReservationResponse from(Reservation reservation) {
        String memberNickname = reservation.getMember().isDeleted()
                ? "탈퇴한 회원"
                : reservation.getMember().getNickname();
        Long studyId = reservation.getStudy() == null
                ? null
                : reservation.getStudy().getId();
        Long postId = reservation.getStudy() == null
                ? null
                : reservation.getStudy().getPost().getId();

        return new ReservationResponse(
                reservation.getId(),
                reservation.getRoom().getId(),
                reservation.getRoom().getName(),
                reservation.getMember().getId(),
                memberNickname,
                reservation.getDate(),
                reservation.getStartTime(),
                reservation.getEndTime(),
                reservation.getTitle(),
                reservation.getStatus().name(),
                studyId,
                postId
        );
    }
}
