package com.devs.devmate.reservation.dto;


import com.devs.devmate.reservation.entity.Reservation;
import com.devs.devmate.reservation.entity.ReservationSpace;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationResponse(
        Long id,
        Long reservationSpaceId,
        String reservationSpaceName,
        String reservationSpaceAddress,
        Long memberId,
        String memberNickname,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String title,
        String status,
        Long studyId,
        Long postId,
        Double latitude,
        Double longitude
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
        ReservationSpace space = reservation.getReservationSpace();

        return new ReservationResponse(
                reservation.getId(),
                space.getId(),
                space.getName(),
                space.getAddress(),
                reservation.getMember().getId(),
                memberNickname,
                reservation.getDate(),
                reservation.getStartTime(),
                reservation.getEndTime(),
                reservation.getTitle(),
                reservation.getStatus().name(),
                studyId,
                postId,
                space.getLatitude(),
                space.getLongitude()
        );
    }
}
