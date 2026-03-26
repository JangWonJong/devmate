package com.devs.devmate.member.service;

import com.devs.devmate.member.dto.*;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.ProfileLink;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MemberService {

    MemberSignupResponse signup(MemberSignUpRequest request, MultipartFile profileImage);

    MeResponse getMe(Long memberId);

    MeResponse updateProfile(Long memberId, MemberUpdateRequest request, MultipartFile profileImage);

    void changePassword(Long memberId, PasswordChangeRequest request);

    void withdraw(Long memberId, WithdrawRequest request);

}
