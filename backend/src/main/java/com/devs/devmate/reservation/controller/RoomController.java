package com.devs.devmate.reservation.controller;

import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.reservation.dto.RoomResponse;
import com.devs.devmate.reservation.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomRepository roomRepository;

    @GetMapping
    public ApiResponse<List<RoomResponse>> list() {
        List<RoomResponse> res = roomRepository.findAll().stream()
                .map(r -> new RoomResponse(r.getId(), r.getName()))
                .toList();
        return ApiResponse.ok(res);
    }

}
