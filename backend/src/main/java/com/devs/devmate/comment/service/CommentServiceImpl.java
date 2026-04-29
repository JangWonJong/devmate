package com.devs.devmate.comment.service;

import com.devs.devmate.comment.dto.CommentCreateRequest;
import com.devs.devmate.comment.dto.CommentResponse;
import com.devs.devmate.comment.dto.MyCommentResponse;
import com.devs.devmate.comment.entity.Comment;
import com.devs.devmate.comment.entity.CommentUpdateRequest;
import com.devs.devmate.comment.repository.CommentRepository;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.like.repository.CommentLikeRepository;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.MemberStatus;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.notification.service.NotificationService;
import com.devs.devmate.post.entity.Post;
import com.devs.devmate.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService{

    private final CommentRepository commentRepository;
    private final MemberRepository memberRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;
    private final CommentLikeRepository commentLikeRepository;

    @Override
    public Long create(Long memberId, Long postId, CommentCreateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (member.getStatus() == MemberStatus.SUSPENDED) {
            throw new BusinessException(ErrorCode.SUSPENDED_MEMBER);
        }

        if (member.getStatus() == MemberStatus.DELETED) {
            throw new BusinessException(ErrorCode.DELETED_MEMBER);
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        Comment comment = Comment.builder()
                .member(member)
                .post(post)
                .content(request.getContent().trim())
                .build();

        Comment savedComment = commentRepository.save(comment);

        notificationService.createCommentCreated(
                post.getMember(),
                member,
                post.getId(),
                savedComment.getId()
        );

        return savedComment.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> list(Long postId, Long memberId) {
        postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        List<Comment> comments = commentRepository.findByPostIdOrderByIdAsc(postId);

        List<Long> commentIds = comments.stream()
                .map(Comment::getId)
                .toList();

        Set<Long> likedCommentIds;
        if (memberId != null && !commentIds.isEmpty()) {
            likedCommentIds = commentLikeRepository.findAllByCommentIdInAndMemberId(commentIds, memberId)
                    .stream()
                    .map(commentLike -> commentLike.getComment().getId())
                    .collect(Collectors.toSet());
        } else {
            likedCommentIds = Collections.emptySet();
        }

        return comments.stream()
                .map(comment -> CommentResponse.from(
                        comment,
                        commentLikeRepository.countByCommentId(comment.getId()),
                        likedCommentIds.contains(comment.getId())
                ))
                .toList();
    }

    @Override
    public void delete(Long memberId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        if (!comment.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_COMMENT);
        }

        commentLikeRepository.deleteAllByCommentId(commentId);
        commentRepository.delete(comment);
    }

    @Override
    public void update(Long memberId, Long commentId, CommentUpdateRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        if (!comment.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_COMMENT);
        }
        System.out.println(request.getContent().trim());
        comment.updateContent(request.getContent().trim());
    }

    @Transactional
    @Override
    public void adopt(Long memberId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        Post post = comment.getPost();

        if (!post.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_COMMENT);
        }

        commentRepository.findByPostIdAndAdoptedTrue(post.getId())
                .ifPresent(Comment::unadopt);

        comment.adopt();
        post.markSolved();

        notificationService.createCommentAccepted(
                comment.getMember(),
                post.getMember(),
                post.getId(),
                comment.getId()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<MyCommentResponse> getMyComments(Long memberId) {
        List<Comment> comments = commentRepository.findByMemberIdOrderByCreatedAtDesc(memberId);

        return comments.stream()
                .map(MyCommentResponse::from)
                .toList();
    }
}
