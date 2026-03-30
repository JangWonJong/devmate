package com.devs.devmate.member.controller;


import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.like.dto.MemberLikeStatusResponse;
import com.devs.devmate.like.service.MemberLikeService;
import com.devs.devmate.member.dto.*;
import com.devs.devmate.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;
    private final MemberLikeService memberLikeService;

    @GetMapping("/me")
    public ApiResponse<MeResponse> me(){
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(memberService.getMe(memberId));
    }

    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MemberSignupResponse> signup(
            @RequestPart("request") @Valid MemberSignUpRequest request,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage)
    {
        return ApiResponse.ok(memberService.signup(request, profileImage));
    }

    @PatchMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MeResponse> updateProfile(
            @RequestPart("request") @Valid MemberUpdateRequest request,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage)
    {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(memberService.updateProfile(memberId, request, profileImage));
    }

    @PatchMapping("/me/password")
    public ApiResponse<Void> changePassword(@RequestBody @Valid PasswordChangeRequest request) {
        Long memberId = SecurityUtil.currentMemberId();
        memberService.changePassword(memberId, request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/me")
    public ApiResponse<Void> withdraw(@RequestBody @Valid WithdrawRequest request) {
        Long memberId = SecurityUtil.currentMemberId();
        memberService.withdraw(memberId, request);
        return ApiResponse.ok();
    }

    @GetMapping("/{memberId}")
    public ApiResponse<MemberProfileResponse> getProfile(@PathVariable Long memberId) {
        return ApiResponse.ok(memberService.getProfile(memberId));
    }

    @PostMapping("/{memberId}/likes")
    public ApiResponse<Void> likeProfile(@PathVariable Long memberId) {
        Long actorMemberId = SecurityUtil.currentMemberId();
        memberLikeService.like(actorMemberId, memberId);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{memberId}/likes")
    public ApiResponse<Void> unlikeProfile(@PathVariable Long memberId) {
        Long actorMemberId = SecurityUtil.currentMemberId();
        memberLikeService.unlike(actorMemberId, memberId);
        return ApiResponse.ok();
    }

    @GetMapping("/{memberId}/likes/me")
    public ApiResponse<MemberLikeStatusResponse> getProfileLikeStatus(@PathVariable Long memberId) {
        Long actorMemberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(memberLikeService.getStatus(actorMemberId, memberId));
    }


    @GetMapping("/popular")
    public ApiResponse<List<PopularMemberResponse>> getPopularMember(
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ApiResponse.ok(memberService.getPopularMembers(limit));
    }


}
