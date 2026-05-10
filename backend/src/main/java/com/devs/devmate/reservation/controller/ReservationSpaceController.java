package com.devs.devmate.reservation.controller;

import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.reservation.dto.AvailabilityResponse;
import com.devs.devmate.reservation.dto.ReservationSpaceResponse;
import com.devs.devmate.reservation.repository.ReservationSpaceRepository;
import com.devs.devmate.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservation-spaces")
public class ReservationSpaceController {

    private final ReservationSpaceRepository reservationSpaceRepository;
    private final ReservationService reservationService;

    @GetMapping
    public ApiResponse<List<ReservationSpaceResponse>> list() {
        List<ReservationSpaceResponse> res = reservationSpaceRepository.findByActiveTrue().stream()
                .map(space -> new ReservationSpaceResponse(
                        space.getId(),
                        space.getName(),
                        space.getAddress(),
                        space.getLatitude(),
                        space.getLongitude(),
                        space.getProviderType().name()
                ))
                .toList();

        return ApiResponse.ok(res);
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


}
