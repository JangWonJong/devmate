package com.devs.devmate.post.service;

import com.devs.devmate.post.dto.PostCreateRequest;
import com.devs.devmate.post.dto.PostResponse;
import com.devs.devmate.post.dto.PostUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostService {

    Long create(Long memberId, PostCreateRequest request);
    Page<PostResponse> list(Pageable pageable);
    PostResponse get(Long postId);
    void update(Long memberId, Long postId, PostUpdateRequest request);
    void delete(Long memberId, Long postId);
    void solve(Long memberId, Long postId);


}
