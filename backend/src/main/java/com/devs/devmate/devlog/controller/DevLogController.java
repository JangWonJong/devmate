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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class DevLogController {

    private final DevLogService devLogService;

    @PostMapping("/devlogs")
    public ApiResponse<Long> create(
            @RequestPart("request") @Valid DevLogCreateRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(devLogService.create(memberId, request, files));
    }

    @GetMapping("/devlogs/mine")
    public ApiResponse<Page<DevLogResponse>> listMine(Pageable pageable) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(devLogService.listMine(memberId, pageable));
    }

    @GetMapping("/members/{memberId}/devlogs")
    public ApiResponse<Page<DevLogResponse>> listByMember(
            @PathVariable Long memberId,
            Pageable pageable
    ) {
        return ApiResponse.ok(devLogService.listByMember(memberId, pageable));
    }

    @GetMapping("/devlogs/{devLogId}")
    public ApiResponse<DevLogResponse> get(@PathVariable Long devLogId) {
        return ApiResponse.ok(devLogService.get(devLogId));
    }

    @PatchMapping("/devlogs/{devLogId}")
    public ApiResponse<Void> update(
            @PathVariable Long devLogId,
            @RequestPart("request") @Valid DevLogUpdateRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        Long memberId = SecurityUtil.currentMemberId();
        devLogService.update(memberId, devLogId, request, files);
        return ApiResponse.ok();
    }

    @DeleteMapping("/devlogs/{devLogId}")
    public ApiResponse<Void> delete(@PathVariable Long devLogId) {
        Long memberId = SecurityUtil.currentMemberId();
        devLogService.delete(memberId, devLogId);
        return ApiResponse.ok();
    }
}
