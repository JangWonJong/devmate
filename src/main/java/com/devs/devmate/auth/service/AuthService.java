package com.devs.devmate.auth.service;

import com.devs.devmate.auth.dto.LoginRequest;
import com.devs.devmate.auth.dto.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

}
