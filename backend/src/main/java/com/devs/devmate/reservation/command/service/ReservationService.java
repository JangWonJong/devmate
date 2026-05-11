package com.devs.devmate.reservation.command.service;

import com.devs.devmate.reservation.availability.dto.AvailabilityResponse;
import com.devs.devmate.reservation.command.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface ReservationService {

    ReservationCreateResponse create(Long memberId, ReservationCreateRequest req);

    ReservationCreateResponse createForStudy(Long memberId, Long studyId, StudyReservationCreateRequest req);

    Page<ReservationResponse> listMyReservations(Long memberId, Pageable pageable);

    Page<ReservationResponse> listMyReservationsByDate(Long memberId, LocalDate date, Pageable pageable);

    Page<ReservationResponse> listReservationSpaceReservations(Long reservationSpaceId, LocalDate date, Pageable pageable);

    Page<ReservationResponse> listReservationsByDate(LocalDate date, Pageable pageable);

    Page<ReservationResponse> listStudyReservations(Long studyId, Pageable pageable);

    void cancel(Long memberId, Long reservationId);

    AvailabilityResponse getAvailability(Long reservationSpaceId, Long memberId, LocalDate date);

}
