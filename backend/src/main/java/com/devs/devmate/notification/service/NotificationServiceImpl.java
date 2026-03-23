package com.devs.devmate.notification.service;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.notification.dto.NotificationResponse;
import com.devs.devmate.notification.dto.NotificationUnreadCountResponse;
import com.devs.devmate.notification.entity.Notification;
import com.devs.devmate.notification.entity.NotificationType;
import com.devs.devmate.notification.repository.NotificationRepository;
import com.devs.devmate.post.entity.Post;
import com.devs.devmate.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService{

    private final NotificationRepository notificationRepository;
    private final PostRepository postRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> list(Long memberId, Pageable pageable) {
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(memberId, pageable)
                .map(NotificationResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationUnreadCountResponse getUnreadCount(Long memberId) {
        long count = notificationRepository.countByReceiverIdAndIsReadFalse(memberId);
        return new NotificationUnreadCountResponse(count);
    }

    @Override
    public void markAsRead(Long memberId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndReceiverId(notificationId, memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.isRead()) {
            notification.markAsRead();
        }
    }

    @Override
    public void markAllAsRead(Long memberId) {
        List<Notification> notifications = notificationRepository.findAllByReceiverIdAndIsReadFalse(memberId);

        for (Notification notification : notifications) {
            notification.markAsRead();
        }
    }

    @Override
    public void createCommentCreated(Member receiver, Member actor, Long postId) {
        if (receiver.getId().equals(actor.getId())) {
            return;
        }

        notificationRepository.save(Notification.builder()
                        .receiver(receiver)
                        .actor(actor)
                        .type(NotificationType.COMMENT_CREATED)
                        .content(actor.getNickname() + "님이 내 게시글에 댓글을 남겼어요")
                        .targetUrl("/posts/" + postId)
                        .build());
    }

    @Override
    public void createCommentAccepted(Member receiver, Member actor, Long postId) {
        if (receiver.getId().equals(actor.getId())) {
            return;
        }

        notificationRepository.save(Notification.builder()
                        .receiver(receiver)
                        .actor(actor)
                        .type(NotificationType.COMMENT_ACCEPTED)
                        .content("내 댓글이 채택되었어요")
                        .targetUrl("/posts/" + postId)
                        .build());


    }

    @Override
    public void createStudyNoticeUpdated(Member receiver, Member actor, Long postId, String studyTitle) {
        if (receiver.getId().equals(actor.getId())) {
            return;
        }

        notificationRepository.save(Notification.builder()
                .receiver(receiver)
                .actor(actor)
                .type(NotificationType.STUDY_NOTICE_UPDATED)
                .content( "[" + studyTitle + "] 스터디 공지가 수정되었어요")
                .targetUrl("/posts/" + postId)
                .build());
    }

    @Override
    public void createStudyJoined(Member receiver, Member actor, Long postId, String studyTitle) {
        if (receiver.getId().equals(actor.getId())){
            return;
        }

        notificationRepository.save(Notification.builder()
                        .receiver(receiver)
                        .actor(actor)
                        .type(NotificationType.STUDY_JOINED)
                        .content(actor.getNickname() + "님이 [" +studyTitle + "] 스터디에 참여했어요")
                        .targetUrl("/posts/" + postId)
                        .build());
    }

    @Override
    public void createStudyReservationCreated(Member receiver, Member actor, Long postId, String studyTitle) {
        if (receiver.getId().equals(actor.getId())) {
            return;
        }

        notificationRepository.save(Notification.builder()
                        .receiver(receiver)
                        .actor(actor)
                        .type(NotificationType.STUDY_RESERVATION_CREATED)
                        .content(actor.getNickname() + "님이 [" + studyTitle + "] 스터디 예약을 했어요")
                        .targetUrl("/posts/" + postId)
                        .build());
    }

    @Override
    public void createStudyLeave(Member receiver, Member actor, Long postId, String postTitle) {
        if (receiver.getId().equals(actor.getId())) {
            return;
        }

        notificationRepository.save(Notification.builder()
                        .receiver(receiver)
                        .actor(actor)
                        .type(NotificationType.STUDY_LEAVE)
                        .content(actor.getNickname() + "님이 [" + postTitle + "] 스터디에서 탈퇴했어요.")
                        .targetUrl("/posts/" + postId)
                        .build());
    }
}
