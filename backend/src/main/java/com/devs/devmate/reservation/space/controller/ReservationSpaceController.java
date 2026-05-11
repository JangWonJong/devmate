package com.devs.devmate.reservation.space.controller;

import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.reservation.availability.dto.AvailabilityResponse;
import com.devs.devmate.reservation.space.dto.ReservationSpaceCreateRequest;
import com.devs.devmate.reservation.space.dto.ReservationSpaceResponse;
import com.devs.devmate.reservation.command.service.ReservationService;
import com.devs.devmate.reservation.space.service.ReservationSpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservation-spaces")
public class ReservationSpaceController {

    private final ReservationSpaceService reservationSpaceService;
    private final ReservationService reservationService;

    @GetMapping
    public ApiResponse<List<ReservationSpaceResponse>> list() {
        return ApiResponse.ok(reservationSpaceService.listActive());
    }

    @GetMapping("/{reservationSpaceId}/availability")
    public ApiResponse<AvailabilityResponse> getAvailability(
            @PathVariable Long reservationSpaceId,
            @RequestParam LocalDate date
    ) {
        Long memberId = SecurityUtil.currentMemberId();

        return ApiResponse.ok(
                reservationService.getAvailability(reservationSpaceId, memberId, date)
        );
    }

    @PostMapping("/user-input")
    public ApiResponse<ReservationSpaceResponse> createUserInputSpace(
            @RequestBody ReservationSpaceCreateRequest request
    ) {
        return ApiResponse.ok(reservationSpaceService.createUserInputSpace(request));
    }


}
