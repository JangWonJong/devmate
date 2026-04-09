package com.devs.devmate.bookmark.service;

import com.devs.devmate.bookmark.dto.PostBookmarkStatusResponse;
import com.devs.devmate.post.dto.PostResponse;

import java.util.List;

public interface PostBookmarkService {

    void bookmark(Long memberId, Long postId);

    void unbookmark(Long memberId, Long postId);

    PostBookmarkStatusResponse getStatus(Long memberId, Long postId);

    long count(Long postId);

    List<PostResponse> listBookmarkedPosts(Long memberId);
}
