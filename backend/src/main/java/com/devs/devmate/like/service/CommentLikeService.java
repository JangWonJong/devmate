package com.devs.devmate.like.service;

import com.devs.devmate.like.dto.CommentLikeStatusResponse;

public interface CommentLikeService {

    void like(Long memberId, Long commentId);

    void unlike(Long memberId, Long commentId);

    CommentLikeStatusResponse getStatus(Long memberId, Long commentId);

    long count(Long commentId);
}
