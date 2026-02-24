package com.devs.devmate.auth.controller;

import com.devs.devmate.auth.dto.LoginRequest;
import com.devs.devmate.auth.dto.LoginResponse;
import com.devs.devmate.auth.service.AuthService;
import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @GetMapping("/me")
    public ApiResponse<Long> me(){
        return ApiResponse.ok(SecurityUtil.currentMemberId());
    }


    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody @Valid LoginRequest request){
        System.out.println("###login called###");
        return ApiResponse.ok(authService.login(request));
    }
}
