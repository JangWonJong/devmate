package com.devs.devmate.like.dto.devlog;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DevLogLikeStatusResponse {

    private boolean likedByMe;
    private long likeCount;
}
