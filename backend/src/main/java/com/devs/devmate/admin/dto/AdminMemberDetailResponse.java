package com.devs.devmate.admin.dto;


import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.MemberStatus;
import com.devs.devmate.member.entity.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminMemberDetailResponse {

    private Long id;
    private String name;
    private String nickname;
    private String email;
    private String phone;
    private String bio;
    private String profileImageUrl;
    private Role role;
    private MemberStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminMemberDetailResponse from(Member member) {
        return AdminMemberDetailResponse.builder()
                .id(member.getId())
                .name(member.getName())
                .nickname(member.getNickname())
                .email(member.getEmail())
                .phone(member.getPhone())
                .bio(member.getBio())
                .profileImageUrl(member.getProfileImageUrl())
                .role(member.getRole())
                .status(member.getStatus())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }


}
