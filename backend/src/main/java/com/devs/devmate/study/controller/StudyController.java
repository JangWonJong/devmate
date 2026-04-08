package com.devs.devmate.study.controller;


import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.reservation.dto.ReservationCreateResponse;
import com.devs.devmate.reservation.dto.ReservationResponse;
import com.devs.devmate.reservation.dto.StudyReservationCreateRequest;
import com.devs.devmate.reservation.service.ReservationService;
import com.devs.devmate.study.dto.*;
import com.devs.devmate.study.service.StudyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/studies")
public class StudyController {

    private final StudyService studyService;
    private final ReservationService reservationService;

    @PostMapping
    public ApiResponse<Long> create(@RequestBody @Valid StudyCreateRequest request) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(studyService.create(memberId, request));
    }

    @PostMapping("/{studyId}/join")
    public ApiResponse<Long> join(@PathVariable Long studyId) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(studyService.join(memberId, studyId));
    }

    @PostMapping("/{studyId}/leave")
    public ApiResponse<Long> leave(@PathVariable Long studyId) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(studyService.leave(memberId, studyId));
    }

    @PostMapping("/{studyId}/close")
    public ApiResponse<Long> close(@PathVariable Long studyId) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(studyService.close(memberId, studyId));
    }

    @PostMapping("/{studyId}/delegate")
    public ApiResponse<Long> delegateLeader(
            @PathVariable Long studyId, @RequestBody @Valid StudyLeaderDelegateRequest request) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(studyService.delegateLeader(memberId, studyId, request.targetMemberId()));
    }

    @PostMapping("/{studyId}/reservations")
    public ApiResponse<ReservationCreateResponse> createReservation(
            @PathVariable Long studyId,
            @RequestBody @Valid StudyReservationCreateRequest request
    ) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(reservationService.createForStudy(memberId, studyId, request));
    }

    @GetMapping("/{studyId}")
    public ApiResponse<StudyResponse> get(@PathVariable Long studyId) {
        return ApiResponse.ok(studyService.get(studyId));
    }

    @GetMapping("/{studyId}/members")
    public ApiResponse<List<StudyMemberResponse>> getMembers(@PathVariable Long studyId) {
        return ApiResponse.ok(studyService.getMembers(studyId));
    }

    @GetMapping("/me")
    public ApiResponse<List<StudyResponse>> getMyStudies() {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(studyService.getMyStudies(memberId));
    }

    @GetMapping("/post/{postId}")
    public ApiResponse<StudyResponse> getByPostId(@PathVariable Long postId) {
        return ApiResponse.ok(studyService.getByPostId(postId));
    }

    @GetMapping("/{studyId}/reservations")
    public ApiResponse<Page<ReservationResponse>> listReservations(
            @PathVariable Long studyId,
            Pageable pageable
    ) {
        return ApiResponse.ok(reservationService.listStudyReservations(studyId, pageable));
    }

    @GetMapping("/popular")
    public ApiResponse<List<StudyResponse>> listPopular(
            @RequestParam(defaultValue = "3") int limit
    ) {
        Long memberId = SecurityUtil.currentMemberIdOrNull();
        return ApiResponse.ok(studyService.listPopular(memberId, limit));
    }

    @PatchMapping("/{studyId}/capacity")
    public ApiResponse<Long> updateCapacity(
            @PathVariable Long studyId,
            @RequestBody @Valid StudyCapacityUpdateRequest request
            ) {
        Long memberId = SecurityUtil.currentMemberId();

        return ApiResponse.ok(
                studyService.updateCapacity(memberId, studyId, request.maxMembers())
        );
    }

    @PatchMapping("/{studyId}/notice")
    public ApiResponse<Long> updateNotice(
            @PathVariable Long studyId,
            @RequestBody @Valid StudyNoticeUpdateRequest request
    ) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(
                studyService.updateNotice(memberId, studyId, request.notice())
        );
    }
}
