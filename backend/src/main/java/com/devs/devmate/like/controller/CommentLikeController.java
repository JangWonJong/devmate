package com.devs.devmate.like.controller;


import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.like.dto.CommentLikeStatusResponse;
import com.devs.devmate.like.service.CommentLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments/{commentId}/likes")
public class CommentLikeController {

    private final CommentLikeService commentLikeService;

    @PostMapping
    public ApiResponse<Void> like(@PathVariable Long commentId) {
        Long memberId = SecurityUtil.currentMemberId();
        commentLikeService.like(memberId, commentId);
        return ApiResponse.ok();
    }

    @DeleteMapping
    public ApiResponse<Void> unlike(@PathVariable Long commentId) {
        Long memberId = SecurityUtil.currentMemberId();
        commentLikeService.unlike(memberId, commentId);
        return ApiResponse.ok();
    }

    @GetMapping("/me")
    public ApiResponse<CommentLikeStatusResponse> getMyLikeStatus(@PathVariable Long commentId) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(commentLikeService.getStatus(memberId, commentId));
    }
}
