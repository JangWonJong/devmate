package com.devs.devmate.like.controller.devlog;


import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.like.dto.devlog.DevLogCommentLikeStatusResponse;
import com.devs.devmate.like.service.devlog.DevLogCommentLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/devlog-comments/{commentId}/likes")
public class DevLogCommentLikeController {

    private final DevLogCommentLikeService devLogCommentLikeService;

    @PostMapping
    public ApiResponse<Void> like(@PathVariable Long commentId) {
        Long memberId = SecurityUtil.currentMemberId();
        devLogCommentLikeService.like(memberId, commentId);
        return ApiResponse.ok();
    }

    @DeleteMapping
    public ApiResponse<Void> unlike(@PathVariable Long commentId) {
        Long memberId = SecurityUtil.currentMemberId();
        devLogCommentLikeService.unlike(memberId, commentId);
        return ApiResponse.ok();
    }

    @GetMapping("/me")
    public ApiResponse<DevLogCommentLikeStatusResponse> getMyLikeStatus(@PathVariable Long commentId) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(devLogCommentLikeService.getStatus(memberId, commentId));
    }
}
