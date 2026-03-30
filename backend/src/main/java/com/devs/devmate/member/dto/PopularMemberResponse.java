package com.devs.devmate.member.dto;

import com.devs.devmate.member.entity.MemberStatus;

public record PopularMemberResponse(
        Long id,
        String nickname,
        String bio,
        String profileImageUrl,
        MemberStatus status,
        long receivedLikeCount,
        long profileLikeCount,
        long popularityScore
) {
}
