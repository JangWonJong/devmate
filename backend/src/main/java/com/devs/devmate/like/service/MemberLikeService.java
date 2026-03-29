package com.devs.devmate.like.service;

import com.devs.devmate.like.dto.MemberLikeStatusResponse;

public interface MemberLikeService {

    void like(Long actorMemberId, Long targetMemberId);

    void unlike(Long actorMemberId, Long targetMemberId);

    MemberLikeStatusResponse getStatus(Long actorMemberId, Long targetMemberId);
}
