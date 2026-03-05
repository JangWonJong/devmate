package com.devs.devmate.reservation.controller;


import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.reservation.dto.ReservationCreateRequest;
import com.devs.devmate.reservation.dto.ReservationCreateResponse;
import com.devs.devmate.reservation.dto.ReservationResponse;
import com.devs.devmate.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservations")
public class ReservationController {
    private final ReservationService reservationService;

    @PostMapping
    public ApiResponse<ReservationCreateResponse> create(@RequestBody @Valid ReservationCreateRequest req) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(reservationService.create(memberId, req));
    }

    @GetMapping
    public ApiResponse<Page<ReservationResponse>> list(
            @RequestParam(required = false) Long roomId,
            @RequestParam LocalDate date,
            Pageable pageable
    ) {
        if (roomId == null) {
            return ApiResponse.ok(reservationService.listAllByDate(date, pageable)); // 네가 만든 메소드명에 맞춰 수정
        }
        return ApiResponse.ok(reservationService.listRoomDate(roomId, date, pageable));
    }


    @GetMapping("/mine")
    public ApiResponse<Page<ReservationResponse>> mine(Pageable pageable) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(reservationService.listMine(memberId, pageable));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        Long memberId = SecurityUtil.currentMemberId();
        reservationService.cancel(memberId, id);
        return ApiResponse.ok();
    }

}
