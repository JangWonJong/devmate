package com.devs.devmate.devlog.controller;


import com.devs.devmate.devlog.dto.DevLogCreateRequest;
import com.devs.devmate.devlog.dto.DevLogResponse;
import com.devs.devmate.devlog.dto.DevLogUpdateRequest;
import com.devs.devmate.devlog.service.DevLogService;
import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/devlogs")
public class DevLogController {

    private final DevLogService devLogService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Long> create(
            @RequestPart("request") @Valid DevLogCreateRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(devLogService.create(memberId, request, files));
    }

    @GetMapping("/mine")
    public ApiResponse<Page<DevLogResponse>> listMine(
            @RequestParam(required = false) String keyword,
            Pageable pageable) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(devLogService.listMine(memberId, keyword, pageable));
    }

    @GetMapping("/{devLogId}")
    public ApiResponse<DevLogResponse> get(@PathVariable Long devLogId) {
        Long memberId = SecurityUtil.currentMemberIdOrNull();
        return ApiResponse.ok(devLogService.get(memberId, devLogId));
    }

    @PatchMapping(value = "/{devLogId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Void> update(
            @PathVariable Long devLogId,
            @RequestPart("request") @Valid DevLogUpdateRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        Long memberId = SecurityUtil.currentMemberId();
        devLogService.update(memberId, devLogId, request, files);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{devLogId}")
    public ApiResponse<Void> delete(@PathVariable Long devLogId) {
        Long memberId = SecurityUtil.currentMemberId();
        devLogService.delete(memberId, devLogId);
        return ApiResponse.ok();
    }
}
