package com.devs.devmate.notification.service;

import com.devs.devmate.member.entity.Member;
import com.devs.devmate.notification.dto.NotificationResponse;
import com.devs.devmate.notification.dto.NotificationUnreadCountResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    Page<NotificationResponse> list(Long memberId, Pageable pageable);

    NotificationUnreadCountResponse getUnreadCount(Long memberId);

    void markAsRead(Long memberId, Long notificationId);

    void markAllAsRead(Long memberId);

    void createCommentCreated(Member receiver, Member actor, Long postId);

    void createCommentAccepted(Member receiver, Member actor, Long postId);

    void createStudyNoticeUpdated(Member receiver, Member actor, Long studyId, String studyTitle);

}

