package com.devs.devmate.like.service;

import com.devs.devmate.like.dto.PostLikesStatusResponse;

public interface PostLikeService {

    void like(Long memberId, Long postId);

    void unlike(Long memberId, Long postId);

    PostLikesStatusResponse getStatus(Long memberId, Long postId);

    long count(Long postId);
}
