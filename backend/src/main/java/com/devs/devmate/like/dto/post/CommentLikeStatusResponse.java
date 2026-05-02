package com.devs.devmate.like.dto.post;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CommentLikeStatusResponse {
    private boolean likedByMe;
    private long likeCount;
}
