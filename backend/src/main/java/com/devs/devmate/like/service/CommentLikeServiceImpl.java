package com.devs.devmate.like.service;

import com.devs.devmate.comment.entity.Comment;
import com.devs.devmate.comment.repository.CommentRepository;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.like.dto.CommentLikeStatusResponse;
import com.devs.devmate.like.entity.CommentLike;
import com.devs.devmate.like.repository.CommentLikeRepository;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentLikeServiceImpl implements CommentLikeService{

    private final CommentLikeRepository commentLikeRepository;
    private final CommentRepository commentRepository;
    private final MemberRepository memberRepository;
    private final NotificationService notificationService;


    @Override
    @Transactional
    public void like(Long memberId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        boolean alreadyLiked = commentLikeRepository.existsByCommentIdAndMemberId(commentId, memberId);
        if (alreadyLiked) {
            return;
        }

        commentLikeRepository.save(
                CommentLike.builder()
                        .comment(comment)
                        .member(member)
                        .build()
        );

        Long receiverId = comment.getMember().getId();
        if (!receiverId.equals(memberId)) {
            notificationService.createCommentLiked(
                    receiverId,
                    memberId,
                    comment.getPost().getId(),
                    comment.getContent()
            );
        }
    }

    @Override
    @Transactional
    public void unlike(Long memberId, Long commentId) {
        commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        commentLikeRepository.findByCommentIdAndMemberId(commentId, memberId)
                .ifPresent(commentLikeRepository::delete);
    }

    @Override
    public CommentLikeStatusResponse getStatus(Long memberId, Long commentId) {

        if (!commentRepository.existsById(commentId)) {
            throw new BusinessException(ErrorCode.COMMENT_NOT_FOUND);
        }

        boolean likedByMe = commentLikeRepository.existsByCommentIdAndMemberId(commentId, memberId);
        long likeCount = commentLikeRepository.countByCommentId(commentId);

        return new CommentLikeStatusResponse(likedByMe, likeCount);
    }

    @Override
    public long count(Long commentId) {
        if (!commentRepository.existsById(commentId)) {
            throw new BusinessException(ErrorCode.COMMENT_NOT_FOUND);
        }
        return commentLikeRepository.countByCommentId(commentId);
    }
}
