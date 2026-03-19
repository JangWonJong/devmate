package com.devs.devmate.notification.dto;

import com.devs.devmate.notification.entity.Notification;
import com.devs.devmate.notification.entity.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String content,
        String targetUrl,
        boolean isRead,
        String actorNickname,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getContent(),
                notification.getTargetUrl(),
                notification.isRead(),
                notification.getActor() != null ? notification.getActor().getNickname() : null,
                notification.getCreatedAt()
        );
    }
}
