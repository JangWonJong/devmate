package com.devs.devmate.comment.controller;


import com.devs.devmate.comment.dto.CommentCreateRequest;
import com.devs.devmate.comment.dto.CommentResponse;
import com.devs.devmate.comment.service.CommentService;
import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts/{postId}/comments")
public class PostCommentController {

    private final CommentService commentService;

    @PostMapping
    public ApiResponse<Long> create(@PathVariable Long postId,
                                    @RequestBody @Valid CommentCreateRequest request) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(commentService.create(memberId, postId, request));

    }

    @GetMapping
    public ApiResponse<List<CommentResponse>> list(@PathVariable Long postId) {
        return ApiResponse.ok(commentService.list(postId));
    }
}
