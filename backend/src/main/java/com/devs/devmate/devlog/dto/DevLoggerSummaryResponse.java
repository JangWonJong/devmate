package com.devs.devmate.devlog.dto;

import com.devs.devmate.member.entity.Member;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class DevLoggerSummaryResponse {

    private Long memberId;
    private String nickname;
    private String bio;
    private String profileImageUrl;
    private long devLogCount;
    private LocalDateTime latestDevLogCreatedAt;

    public static DevLoggerSummaryResponse from(
            Member member, long devLogCount, LocalDateTime latestDevLogCreatedAt) {
        return DevLoggerSummaryResponse.builder()
                .memberId(member.getId())
                .nickname(member.isDeleted() ? "탈퇴한 회원" : member.getNickname())
                .bio(member.getBio())
                .profileImageUrl(member.getProfileImageUrl())
                .devLogCount(devLogCount)
                .latestDevLogCreatedAt(latestDevLogCreatedAt)
                .build();
    }
}
