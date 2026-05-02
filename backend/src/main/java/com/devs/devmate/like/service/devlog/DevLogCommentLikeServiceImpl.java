package com.devs.devmate.like.service.devlog;

import com.devs.devmate.comment.entity.devlog.DevLogComment;
import com.devs.devmate.comment.repository.devlog.DevLogCommentRepository;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.like.dto.devlog.DevLogCommentLikeStatusResponse;
import com.devs.devmate.like.entity.devlog.DevLogCommentLike;
import com.devs.devmate.like.repository.devlog.DevLogCommentLikeRepository;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DevLogCommentLikeServiceImpl implements DevLogCommentLikeService{

    private final DevLogCommentLikeRepository devLogCommentLikeRepository;
    private final DevLogCommentRepository devLogCommentRepository;
    private final MemberRepository memberRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public void like(Long memberId, Long commentId) {

        DevLogComment comment = devLogCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        boolean alreadyLiked = devLogCommentLikeRepository.existsByCommentIdAndMemberId(commentId, memberId);

        if (alreadyLiked) {
            return;
        }

        devLogCommentLikeRepository.save(
                DevLogCommentLike.builder()
                        .comment(comment)
                        .member(member)
                        .build()
        );

        Long receiverId = comment.getMember().getId();
        if (!receiverId.equals(memberId)) {
            notificationService.createDevLogCommentLiked(
                    receiverId,
                    memberId,
                    comment.getDevLog().getId(),
                    comment.getId()
            );
        }
    }

    @Override
    @Transactional
    public void unlike(Long memberId, Long commentId) {

        devLogCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        devLogCommentLikeRepository.findByCommentIdAndMemberId(commentId, memberId)
                .ifPresent(devLogCommentLikeRepository::delete);
    }

    @Override
    public DevLogCommentLikeStatusResponse getStatus(Long memberId, Long commentId) {

        if (!devLogCommentRepository.existsById(commentId)) {
            throw new BusinessException(ErrorCode.COMMENT_NOT_FOUND);
        }

        boolean likedByMe = devLogCommentLikeRepository.existsByCommentIdAndMemberId(commentId, memberId);
        long likeCount = devLogCommentLikeRepository.countByCommentId(commentId);

        return new DevLogCommentLikeStatusResponse(likedByMe, likeCount);
    }

    @Override
    public long count(Long commentId) {

        if (!devLogCommentRepository.existsById(commentId)) {
            throw new BusinessException(ErrorCode.COMMENT_NOT_FOUND);
        }

        return devLogCommentLikeRepository.countByCommentId(commentId);
    }
}
