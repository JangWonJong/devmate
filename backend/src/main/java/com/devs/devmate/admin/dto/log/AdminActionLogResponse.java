package com.devs.devmate.admin.dto.log;

import com.devs.devmate.admin.entity.AdminActionLog;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminActionLogResponse {

    private Long id;
    private Long targetMemberId;
    private String targetMemberNickname;
    private String targetMemberEmail;

    private String actionType;
    private String description;
    private String adminNickname;
    private String createdAt;

    public static AdminActionLogResponse from(AdminActionLog log) {
        return AdminActionLogResponse.builder()
                .id(log.getId())
                .targetMemberId(log.getTargetMember().getId())
                .targetMemberNickname(log.getTargetMember().getNickname())
                .targetMemberEmail(log.getTargetMember().getEmail())
                .actionType(log.getActionType().name())
                .description(log.getDescription())
                .adminNickname(log.getAdmin().getNickname())
                .createdAt(log.getCreatedAt().toString())
                .build();
    }

}
