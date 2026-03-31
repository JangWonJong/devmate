package com.devs.devmate.notification.service;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.notification.dto.NotificationResponse;
import com.devs.devmate.notification.dto.NotificationUnreadCountResponse;
import com.devs.devmate.notification.entity.Notification;
import com.devs.devmate.notification.entity.NotificationType;
import com.devs.devmate.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService{

    private final NotificationRepository notificationRepository;
    private final MemberRepository memberRepository;

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

    @Override
    public void createPostLiked(Long receiverId, Long actorId, Long postId, String postTitle) {
        Member receiver = memberRepository.findById(receiverId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        Member actor = memberRepository.findById(actorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        String content = actor.getNickname() + "님이 [" + postTitle + "] 게시글을 좋아요했습니다.";

        notificationRepository.save(
                Notification.builder()
                        .receiver(receiver)
                        .actor(actor)
                        .type(NotificationType.POST_LIKED)
                        .content(content)
                        .targetUrl("/posts/" + postId)
                        .build()
        );
    }

    @Override
    public void createCommentLiked(Long receiverId, Long actorId, Long postId, String commentContent) {
        Member receiver = memberRepository.findById(receiverId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        Member actor = memberRepository.findById(actorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        String preview = commentContent;
        if (preview != null && preview.length() >20 ) {
            preview = preview.substring(0, 20) + "...";
        }

        String content = actor.getNickname() + "님이 회원님의 댓글에 좋아요를 했습니다.";
        //String content = actor.getNickname() + "님이 회원님의 댓글(\"" + preview + "\")을 좋아요했습니다.";

        notificationRepository.save(
                Notification.builder()
                        .receiver(receiver)
                        .actor(actor)
                        .type(NotificationType.COMMENT_LIKED)
                        .content(content)
                        .targetUrl("/posts/" + postId)
                        .build()
        );
    }

    @Override
    public void createMemberLiked(Long receiverId, Long actorId, Long targetMemberId) {
        Member receiver = memberRepository.findById(receiverId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        Member actor = memberRepository.findById(actorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (receiverId.equals(actorId)) {
            return;
        }

        String content = actor.getNickname() + "님이 회원님의 프로필을 좋아요했습니다.";

        notificationRepository.save(
                Notification.builder()
                        .receiver(receiver)
                        .actor(actor)
                        .type(NotificationType.MEMBER_LIKED)
                        .content(content)
                        .targetUrl("/members/" + targetMemberId)
                        .build()
        );
    }

}
