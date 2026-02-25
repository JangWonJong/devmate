package com.devs.devmate.member.controller;


import com.devs.devmate.member.dto.MemberSignUpRequest;
import com.devs.devmate.member.dto.MemberSignupResponse;
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

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public MemberSignupResponse signup(@RequestBody @Valid MemberSignUpRequest request){

        return memberService.signup(request);

    }
}
