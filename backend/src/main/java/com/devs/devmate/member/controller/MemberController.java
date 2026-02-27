package com.devs.devmate.member.controller;


import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.member.dto.MeResponse;
import com.devs.devmate.member.dto.MemberSignUpRequest;
import com.devs.devmate.member.dto.MemberSignupResponse;
import com.devs.devmate.member.repository.MemberRepository;
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
    private final MemberRepository memberRepository;


    @GetMapping("/me")
    public ApiResponse<MeResponse> me(){
        Long id = SecurityUtil.currentMemberId();
        var m = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        return ApiResponse.ok(new MeResponse(m.getId(), m.getEmail(), m.getNickname()));
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public MemberSignupResponse signup(@RequestBody @Valid MemberSignUpRequest request){

        return memberService.signup(request);

    }
}
