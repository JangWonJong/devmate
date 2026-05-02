package com.devs.devmate.comment.controller.devlog;


import com.devs.devmate.comment.dto.CommentCreateRequest;
import com.devs.devmate.comment.dto.devlog.DevLogCommentResponse;
import com.devs.devmate.comment.service.devlog.DevLogCommentService;
import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/devlogs/{devLogId}/comments")
public class DevLogCommentController {

    private final DevLogCommentService devLogCommentService;

    @PostMapping
    public ApiResponse<Long> create(
            @PathVariable Long devLogId,
            @RequestBody @Valid CommentCreateRequest request
    ) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(devLogCommentService.create(memberId, devLogId, request));
    }

    @GetMapping
    public ApiResponse<List<DevLogCommentResponse>> list(
            @PathVariable Long devLogId
    ) {
        Long memberId = SecurityUtil.currentMemberIdOrNull();
        return ApiResponse.ok(devLogCommentService.list(memberId, devLogId));
    }

}
