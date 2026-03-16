package com.devs.devmate.member.service;

import com.devs.devmate.member.dto.*;

public interface MemberService {

    MemberSignupResponse signup(MemberSignUpRequest request);

    MeResponse getMe(Long memberId);

    MeResponse updateProfile(Long memberId, MemberUpdateRequest request);

    void changePassword(Long memberId, PasswordChangeRequest request);

    void withdraw(Long memberId, WithdrawRequest request);
}
