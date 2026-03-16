package com.devs.devmate.member.dto;

import com.devs.devmate.member.entity.MemberStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MeResponse {
    private Long id;
    private String email;
    private String name;
    private String nickname;
    private String phone;
    private String bio;
    MemberStatus status;
}
