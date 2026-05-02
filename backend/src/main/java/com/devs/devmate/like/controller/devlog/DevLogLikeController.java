package com.devs.devmate.like.controller.devlog;


import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.like.dto.devlog.DevLogLikeStatusResponse;
import com.devs.devmate.like.service.devlog.DevLogLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/devlogs/{devLogId}/likes")
public class DevLogLikeController {

    private final DevLogLikeService devLogLikeService;

    @PostMapping
    public ApiResponse<Void> like(@PathVariable Long devLogId) {
        Long memberId = SecurityUtil.currentMemberId();
        devLogLikeService.like(memberId, devLogId);
        return ApiResponse.ok(null);
    }

    @DeleteMapping
    public ApiResponse<Void> unlike(@PathVariable Long devLogId) {
        Long memberId = SecurityUtil.currentMemberId();
        devLogLikeService.unlike(memberId, devLogId);
        return ApiResponse.ok(null);
    }

    @GetMapping("/status")
    public ApiResponse<DevLogLikeStatusResponse> likeStatus(@PathVariable Long devLogId) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(devLogLikeService.getStatus(memberId, devLogId));
    }
}
