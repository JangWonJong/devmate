package com.devs.devmate.post.service;

import com.devs.devmate.post.dto.PostCreateRequest;
import com.devs.devmate.post.dto.PostResponse;
import com.devs.devmate.post.dto.PostUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PostService {

    Long create(Long memberId, PostCreateRequest request, List<MultipartFile> files);
    Page<PostResponse> list(Long memberId, String keyword, Boolean solved, String type, Pageable pageable);
    Page<PostResponse> listMine(Long memberId, String keyword, Boolean solved, String type, Pageable pageable);
    Page<PostResponse> listBookmarked(Long memberId, String keyword, Boolean solved, String type, Pageable pageable);
    PostResponse get(Long memberId, Long postId);
    void update(Long memberId, Long postId, PostUpdateRequest request, List<MultipartFile> files);
    void delete(Long memberId, Long postId);
    void solve(Long memberId, Long postId);
    List<PostResponse> listLikedPosts(Long memberId);
    List<PostResponse> listPopular(Long memberId, int limit);
}
