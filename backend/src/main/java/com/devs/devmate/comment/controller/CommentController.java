package com.devs.devmate.comment.controller;

import com.devs.devmate.comment.entity.CommentUpdateRequest;
import com.devs.devmate.comment.service.CommentService;
import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    @PatchMapping("/{commentId}")
    public ApiResponse<Void> update(@PathVariable Long commentId,
                                    @RequestBody @Valid CommentUpdateRequest request) {
        Long memberId = SecurityUtil.currentMemberId();
        commentService.update(memberId, commentId, request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{commentId}")
    public ApiResponse<Void> delete(@PathVariable Long commentId) {
        Long memberId = SecurityUtil.currentMemberId();
        commentService.delete(memberId, commentId);
        return ApiResponse.ok();
    }

    @PatchMapping("/{commentId}/adopt")
    public ApiResponse<Void> adopt(@PathVariable Long commentId) {
        Long memberId = SecurityUtil.currentMemberId();
        commentService.adopt(memberId, commentId);
        return ApiResponse.ok();
    }
}
