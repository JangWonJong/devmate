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
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    @PostMapping
    public ApiResponse<Long> create(@RequestBody @Valid PostCreateRequest request){
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(postService.create(memberId, request));
    }

    @GetMapping
    public ApiResponse<Page<PostResponse>> list(
            @RequestParam(required = false, defaultValue = "false") boolean mine,
            Pageable pageable){
            if (mine) {
                Long memberId = SecurityUtil.currentMemberId();
                return ApiResponse.ok(postService.listMine(memberId, pageable));
            }
        return ApiResponse.ok(postService.list(pageable));
    }

    @GetMapping("/{postId}")
    public ApiResponse<PostResponse> get(@PathVariable Long postId){
        return ApiResponse.ok(postService.get(postId));
    }

    @PatchMapping("/{postId}")
    public ApiResponse<Void> update(@PathVariable Long postId,
                                            @RequestBody @Valid PostUpdateRequest request){
        Long memberId = SecurityUtil.currentMemberId();
        postService.update(memberId, postId, request);
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


}
