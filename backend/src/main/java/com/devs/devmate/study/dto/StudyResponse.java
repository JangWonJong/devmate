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
    private Integer maxMembers;
    private String status;
    private Long currentMembers;
    private LocalDateTime createdAt;

    public static StudyResponse from(Study study, long currentMembers) {
        return StudyResponse.builder()
                .id(study.getId())
                .postId(study.getPost().getId())
                .maxMembers(study.getMaxMembers())
                .status(study.getStatus().name())
                .currentMembers(currentMembers)
                .createdAt(study.getCreatedAt())
                .build();
    }

}
