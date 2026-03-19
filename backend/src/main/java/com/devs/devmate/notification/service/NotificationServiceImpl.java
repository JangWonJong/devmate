package com.devs.devmate.notification.service;

import com.devs.devmate.member.entity.Member;
import com.devs.devmate.notification.dto.NotificationResponse;
import com.devs.devmate.notification.dto.NotificationUnreadCountResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService{


    @Override
    public Page<NotificationResponse> list(Long memberId, Pageable pageable) {
        return null;
    }

    @Override
    public NotificationUnreadCountResponse getUnreadCount(Long memberId) {
        return null;
    }

    @Override
    public void markAsRead(Long memberId, Long notificationId) {

    }

    @Override
    public void markAllAsRead(Long memberId) {

    }

    @Override
    public void createCommentCreated(Member receiver, Member actor, Long postId) {

    }

    @Override
    public void createCommentAccepted(Member receiver, Member actor, Long postId) {

    }

    @Override
    public void createStudyNoticeUpdated(Member receiver, Member actor, Long studyId, String studyTitle) {

    }
}
