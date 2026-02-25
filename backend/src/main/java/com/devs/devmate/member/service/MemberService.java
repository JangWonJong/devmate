package com.devs.devmate.member.service;

import com.devs.devmate.member.dto.MemberSignupResponse;
import com.devs.devmate.member.dto.MemberSignUpRequest;

public interface MemberService {

    MemberSignupResponse signup(MemberSignUpRequest request);
}
