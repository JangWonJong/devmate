package com.devs.devmate.admin.dto;


import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.MemberStatus;
import com.devs.devmate.member.entity.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminMemberResponse {

    private Long id;
    private String nickname;
    private String email;
    private Role role;
    private MemberStatus status;
    private LocalDateTime createdAt;

    public static AdminMemberResponse from(Member member) {
        return AdminMemberResponse.builder()
                .id(member.getId())
                .nickname(member.getNickname())
                .email(member.getEmail())
                .role(member.getRole())
                .status(member.getStatus())
                .createdAt(member.getCreatedAt())
                .build();
    }
}
