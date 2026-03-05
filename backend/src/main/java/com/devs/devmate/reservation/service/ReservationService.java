package com.devs.devmate.reservation.service;

import com.devs.devmate.reservation.dto.ReservationCreateRequest;
import com.devs.devmate.reservation.dto.ReservationCreateResponse;
import com.devs.devmate.reservation.dto.ReservationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface ReservationService {

    ReservationCreateResponse create(Long memberId, ReservationCreateRequest req);

    Page<ReservationResponse> listMine(Long memberId, Pageable pageable);

    Page<ReservationResponse> listRoomDate(Long roomId, LocalDate date, Pageable pageable);

    Page<ReservationResponse> listAllByDate(LocalDate date, Pageable pageable);

    void cancel(Long memberId, Long reservationId);

}
