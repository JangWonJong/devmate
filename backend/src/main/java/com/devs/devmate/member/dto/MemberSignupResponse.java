package com.devs.devmate.member.dto;


import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MemberSignupResponse {

    private Long id;
    private String email;
    private String name;
    private  String nickname;
    private  String phone;
    private  String bio;
    private String profileImageUrl;
    private Role role;

}
