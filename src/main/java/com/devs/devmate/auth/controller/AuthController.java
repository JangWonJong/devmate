package com.devs.devmate.auth.controller;

import com.devs.devmate.auth.dto.LoginRequest;
import com.devs.devmate.auth.dto.LoginResponse;
import com.devs.devmate.auth.service.AuthService;
import com.devs.devmate.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody @Valid LoginRequest request){
        System.out.println("###login called###");
        return ApiResponse.ok(authService.login(request));
    }
}
