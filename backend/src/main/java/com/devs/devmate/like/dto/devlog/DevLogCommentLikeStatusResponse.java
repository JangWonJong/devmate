package com.devs.devmate.like.dto.devlog;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DevLogCommentLikeStatusResponse {
    private boolean likedByMe;
    private long likeCount;
}
