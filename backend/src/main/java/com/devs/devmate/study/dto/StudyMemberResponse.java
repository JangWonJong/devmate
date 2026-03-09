package com.devs.devmate.study.dto;


import com.devs.devmate.study.entity.StudyMember;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class StudyMemberResponse {

    private Long memberId;
    private String nickname;
    private String role;
    private LocalDateTime joinedAt;

    public static StudyMemberResponse from(StudyMember studyMember) {
        return StudyMemberResponse.builder()
                .memberId(studyMember.getMember().getId())
                .nickname(studyMember.getMember().getNickname())
                .role(studyMember.getRole().name())
                .joinedAt(studyMember.getCreatedAt())
                .build();
    }

}
