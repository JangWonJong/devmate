package com.devs.devmate.admin.dto.dashboard;


import com.devs.devmate.member.entity.Member;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminRecentMemberResponse {

    private Long id;
    private String nickname;
    private String email;
    private LocalDateTime createdAt;

    public static AdminRecentMemberResponse from(Member member) {
        return AdminRecentMemberResponse.builder()
                .id(member.getId())
                .nickname(member.getNickname())
                .email(member.getEmail())
                .createdAt(member.getCreatedAt())
                .build();
    }
}
