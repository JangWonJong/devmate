package com.devs.devmate.member.controller;


import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.member.dto.*;
import com.devs.devmate.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/me")
    public ApiResponse<MeResponse> me(){
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(memberService.getMe(memberId));
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MemberSignupResponse> signup(@RequestBody @Valid MemberSignUpRequest request){
        return ApiResponse.ok(memberService.signup(request));
    }

    @PatchMapping("/me")
    public ApiResponse<MeResponse> updateProfile(@RequestBody @Valid MemberUpdateRequest request) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(memberService.updateProfile(memberId, request));
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
}
