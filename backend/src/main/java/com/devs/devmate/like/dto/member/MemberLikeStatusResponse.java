package com.devs.devmate.like.dto.member;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberLikeStatusResponse {
    private boolean likedByMe;
    private long likeCount;
}
