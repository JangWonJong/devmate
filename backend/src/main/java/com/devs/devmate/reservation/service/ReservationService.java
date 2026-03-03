package com.devs.devmate.reservation.service;

import com.devs.devmate.reservation.dto.ReservationCreateRequest;
import com.devs.devmate.reservation.dto.ReservationCreateResponse;
import com.devs.devmate.reservation.dto.ReservationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReservationService {

    public ReservationCreateResponse create(Long memberId, ReservationCreateRequest req);

    Page<ReservationResponse> listMine(Long memberId, Pageable pageable);

    void cancel(Long memberId, Long reservationId);

}
