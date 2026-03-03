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
