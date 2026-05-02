package com.devs.devmate.like.service.devlog;

import com.devs.devmate.like.dto.devlog.DevLogCommentLikeStatusResponse;

public interface DevLogCommentLikeService {

    void like(Long memberId, Long commentId);

    void unlike(Long memberId, Long commentId);

    DevLogCommentLikeStatusResponse getStatus(Long memberId, Long commentId);

    long count(Long commentId);
}
