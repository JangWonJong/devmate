package com.devs.devmate.reservation.controller;

import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.reservation.dto.AvailabilityResponse;
import com.devs.devmate.reservation.dto.RoomResponse;
import com.devs.devmate.reservation.repository.RoomRepository;
import com.devs.devmate.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomRepository roomRepository;
    private final ReservationService reservationService;

    @GetMapping
    public ApiResponse<List<RoomResponse>> list() {
        List<RoomResponse> res = roomRepository.findAll().stream()
                .map(r -> new RoomResponse(r.getId(), r.getName()))
                .toList();
        return ApiResponse.ok(res);
    }

    @GetMapping("/{roomId}/availability")
    public ApiResponse<AvailabilityResponse> getAvailability(
            @PathVariable Long roomId,
            @RequestParam LocalDate date
    ) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(reservationService.getAvailability(roomId, memberId, date));
    }


}
