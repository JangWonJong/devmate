package com.devs.devmate.reservation.command.dto;


import com.devs.devmate.reservation.command.entity.Reservation;
import com.devs.devmate.reservation.space.entity.ReservationSpace;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationResponse(
        Long id,
        Long reservationSpaceId,
        String reservationSpaceName,
        String providerType,
        String reservationSpaceAddress,
        Long memberId,
        String memberNickname,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String title,
        String placeDetail,
        String status,
        Long studyId,
        Long postId,
        String studyPlaceName,
        String studyAddress,
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
        String studyPlaceName = reservation.getStudy() == null
                ? null
                : reservation.getStudy().getPlaceName();

        String studyAddress = reservation.getStudy() == null
                ? null
                : reservation.getStudy().getAddress();

        return new ReservationResponse(
                reservation.getId(),
                space.getId(),
                space.getName(),
                space.getProviderType().name(),
                space.getAddress(),
                reservation.getMember().getId(),
                memberNickname,
                reservation.getDate(),
                reservation.getStartTime(),
                reservation.getEndTime(),
                reservation.getTitle(),
                reservation.getPlaceDetail(),
                reservation.getStatus().name(),
                studyId,
                postId,
                studyPlaceName,
                studyAddress,
                space.getLatitude(),
                space.getLongitude()
        );
    }
}
