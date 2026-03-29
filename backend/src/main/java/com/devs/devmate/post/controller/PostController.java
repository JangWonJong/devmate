package com.devs.devmate.post.controller;


import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.post.dto.PostCreateRequest;
import com.devs.devmate.post.dto.PostResponse;
import com.devs.devmate.post.dto.PostUpdateRequest;
import com.devs.devmate.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Long> create(
            @RequestPart("request") @Valid PostCreateRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ){
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(postService.create(memberId, request, files));
    }

    @GetMapping
    public ApiResponse<Page<PostResponse>> list(
            @RequestParam(required = false, defaultValue = "false") boolean mine,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean solved,
            Pageable pageable){
            if (mine) {
                Long memberId = SecurityUtil.currentMemberId();
                return ApiResponse.ok(postService.listMine(memberId, keyword, solved, pageable));
            }
        return ApiResponse.ok(postService.list(keyword, solved, pageable));
    }

    @GetMapping("/{postId}")
    public ApiResponse<PostResponse> get(@PathVariable Long postId){
        return ApiResponse.ok(postService.get(postId));
    }

    @PatchMapping(value = "/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Void> update(
            @PathVariable Long postId,
            @RequestPart("request") @Valid PostUpdateRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ){
        Long memberId = SecurityUtil.currentMemberId();
        postService.update(memberId, postId, request, files);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{postId}")
    public ApiResponse<Void> delete(@PathVariable Long postId){
        Long memberId = SecurityUtil.currentMemberId();
        postService.delete(memberId, postId);
        return ApiResponse.ok();
    }

    @PatchMapping("/{postId}/solve")
    public ApiResponse<Void> solve(@PathVariable Long postId){
        Long memberId = SecurityUtil.currentMemberId();
        postService.solve(memberId, postId);
        return ApiResponse.ok();
    }

    @GetMapping("/liked")
    public ApiResponse<List<PostResponse>> likedPosts() {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(postService.listLikedPosts(memberId));
    }

}
