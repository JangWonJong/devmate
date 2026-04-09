package com.devs.devmate.bookmark.controller;


import com.devs.devmate.bookmark.dto.PostBookmarkStatusResponse;
import com.devs.devmate.bookmark.service.PostBookmarkService;
import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts/{postId}/bookmarks")
public class PostBookmarkController {

    private final PostBookmarkService postBookmarkService;

    @PostMapping
    public ApiResponse<Void> bookmark(@PathVariable Long postId) {
        Long memberId = SecurityUtil.currentMemberId();
        postBookmarkService.bookmark(memberId, postId);
        return ApiResponse.ok(null);
    }

    @DeleteMapping
    public ApiResponse<Void> unbookmark(@PathVariable Long postId) {
        Long memberId = SecurityUtil.currentMemberId();
        postBookmarkService.unbookmark(memberId, postId);
        return ApiResponse.ok(null);
    }

    @GetMapping("/me")
    public ApiResponse<PostBookmarkStatusResponse> getMyBookmarkStatus(@PathVariable Long postId) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(postBookmarkService.getStatus(memberId, postId));
    }

}
