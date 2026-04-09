package com.devs.devmate.bookmark.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PostBookmarkStatusResponse {

    private boolean bookmarkedByMe;
    private long bookmarkCount;

}
