package com.devs.devmate.like.controller;


import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.like.dto.PostLikesStatusResponse;
import com.devs.devmate.like.service.PostLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts/{postId}/likes")
public class PostLikeController {

    private final PostLikeService postLikeService;

    @PostMapping
    public ApiResponse<Void> like(@PathVariable Long postId) {
        Long memberId = SecurityUtil.currentMemberId();
        postLikeService.like(memberId, postId);
        return ApiResponse.ok(null);
    }

    @DeleteMapping
    public ApiResponse<Void> unlike(@PathVariable Long postId) {
        Long memberId = SecurityUtil.currentMemberId();
        postLikeService.unlike(memberId, postId);
        return ApiResponse.ok(null);
    }

    @GetMapping("/me")
    public ApiResponse<PostLikesStatusResponse> getMyLikeStatus(@PathVariable Long postId) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(postLikeService.getStatus(memberId, postId));
    }
}
