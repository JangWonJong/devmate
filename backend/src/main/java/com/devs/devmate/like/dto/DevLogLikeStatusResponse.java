package com.devs.devmate.like.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DevLogLikeStatusResponse {

    private boolean likedByMe;
    private long likeCount;
}
