package com.devs.devmate.study.controller;


import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.study.dto.StudyCreateRequest;
import com.devs.devmate.study.dto.StudyResponse;
import com.devs.devmate.study.service.StudyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/studies")
public class StudyController {

    private final StudyService studyService;

    @PostMapping
    public ApiResponse<Long> create(@RequestBody @Valid StudyCreateRequest request) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(studyService.create(memberId, request));
    }

    @GetMapping("/{studyId}")
    public ApiResponse<StudyResponse> get(@PathVariable Long studyId) {
        return ApiResponse.ok(studyService.get(studyId));
    }
}
