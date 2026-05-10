package com.devs.devmate.reservation.controller;


import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.common.JwtPrincipal;
import com.devs.devmate.global.common.JwtProvider;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.reservation.dto.ReservationCreateRequest;
import com.devs.devmate.reservation.dto.ReservationCreateResponse;
import com.devs.devmate.reservation.dto.ReservationResponse;
import com.devs.devmate.reservation.service.ReservationService;
import com.devs.devmate.reservation.service.ReservationSseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;
    private final ReservationSseService reservationSseService;
    private final JwtProvider jwtProvider;

    @PostMapping
    public ApiResponse<ReservationCreateResponse> create(@RequestBody @Valid ReservationCreateRequest req) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(reservationService.create(memberId, req));
    }

    @GetMapping
    public ApiResponse<Page<ReservationResponse>> list(
            @RequestParam(required = false) Long reservationSpaceId,
            @RequestParam LocalDate date,
            Pageable pageable
    ) {
        if (reservationSpaceId == null) {
            return ApiResponse.ok(reservationService.listReservationsByDate(date, pageable)); // 네가 만든 메소드명에 맞춰 수정
        }
        return ApiResponse.ok(reservationService.listReservationSpaceReservations(reservationSpaceId, date, pageable));
    }


    @GetMapping("/mine")
    public ApiResponse<Page<ReservationResponse>> mine(
            @RequestParam(required = false) LocalDate date,
            Pageable pageable) {
        Long memberId = SecurityUtil.currentMemberId();
        if (date == null) {
            return ApiResponse.ok(reservationService.listMyReservations(memberId, pageable));
        }

        return ApiResponse.ok(reservationService.listMyReservationsByDate(memberId, date, pageable));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        Long memberId = SecurityUtil.currentMemberId();
        reservationService.cancel(memberId, id);
        return ApiResponse.ok();
    }

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(
            @RequestParam Long reservationSpaceId,
            @RequestParam LocalDate date,
            @RequestParam String token
    ) {
        JwtPrincipal principal = jwtProvider.parseAccessToken(token);
        Long memberId = principal.memberId();
        return reservationSseService.subscribe(memberId, reservationSpaceId, date);
    }

}
