package com.devs.devmate.like.service.post;

import com.devs.devmate.like.dto.post.PostLikesStatusResponse;

public interface PostLikeService {

    void like(Long memberId, Long postId);

    void unlike(Long memberId, Long postId);

    PostLikesStatusResponse getStatus(Long memberId, Long postId);

    long count(Long postId);
}
