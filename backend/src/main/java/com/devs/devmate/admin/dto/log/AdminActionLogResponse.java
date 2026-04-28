package com.devs.devmate.admin.dto.log;

import com.devs.devmate.admin.entity.AdminActionLog;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminActionLogResponse {

    private String actionType;
    private String description;
    private String adminNickname;
    private String createdAt;

    public static AdminActionLogResponse from(AdminActionLog log) {
        return AdminActionLogResponse.builder()
                .actionType(log.getActionType().name())
                .description(log.getDescription())
                .adminNickname(log.getAdmin().getNickname())
                .createdAt(log.getCreatedAt().toString())
                .build();
    }

}
