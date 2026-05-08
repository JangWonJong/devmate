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
    private boolean joinedByMe;
    private LocalDateTime createdAt;

    private String placeName;
    private String address;
    private Double latitude;
    private Double longitude;

    public static StudyResponse from(
            Study study,
            long currentMembers,
            String leaderNickname,
            boolean joinedByMe
    ) {
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
                .joinedByMe(joinedByMe)
                .createdAt(study.getCreatedAt())
                .placeName(study.getPlaceName())
                .address(study.getAddress())
                .latitude(study.getLatitude())
                .longitude(study.getLongitude())
                .build();
    }

}
