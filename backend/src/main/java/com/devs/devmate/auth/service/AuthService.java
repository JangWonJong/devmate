package com.devs.devmate.auth.service;

import com.devs.devmate.auth.dto.LoginRequest;
import com.devs.devmate.auth.dto.LoginResponse;
import com.devs.devmate.auth.dto.ReissueResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    ReissueResponse reissue(String refreshToken);

}
