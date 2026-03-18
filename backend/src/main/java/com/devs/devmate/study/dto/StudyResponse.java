package com.devs.devmate.study.dto;


import com.devs.devmate.study.entity.Study;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class StudyResponse {

    private Long id;
    private Long postId;
    private String postTitle;

    private String authorNickname;
    private String leaderNickname;

    private Integer maxMembers;
    private String notice;
    private String status;
    private Long currentMembers;
    private LocalDateTime createdAt;

    public static StudyResponse from(Study study, long currentMembers, String leaderNickname) {
        String authorNickname = study.getPost().getMember().isDeleted()
                ? "탈퇴한 회원"
                : study.getPost().getMember().getNickname();

        return StudyResponse.builder()
                .id(study.getId())
                .postId(study.getPost().getId())
                .postTitle(study.getPost().getTitle())
                .authorNickname(authorNickname)
                .leaderNickname(leaderNickname)
                .maxMembers(study.getMaxMembers())
                .notice(study.getNotice())
                .status(study.getStatus().name())
                .currentMembers(currentMembers)
                .createdAt(study.getCreatedAt())
                .build();
    }

}
