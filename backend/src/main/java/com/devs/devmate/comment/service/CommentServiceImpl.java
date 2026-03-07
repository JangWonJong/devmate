package com.devs.devmate.comment.service;

import com.devs.devmate.comment.dto.CommentCreateRequest;
import com.devs.devmate.comment.dto.CommentResponse;
import com.devs.devmate.comment.entity.Comment;
import com.devs.devmate.comment.entity.CommentUpdateRequest;
import com.devs.devmate.comment.repository.CommentRepository;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.post.entity.Post;
import com.devs.devmate.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService{

    private final CommentRepository commentRepository;
    private final MemberRepository memberRepository;
    private final PostRepository postRepository;

    @Override
    public Long create(Long memberId, Long postId, CommentCreateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        Comment comment = Comment.builder()
                .member(member)
                .post(post)
                .content(request.getContent().trim())
                .build();

        return commentRepository.save(comment).getId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> list(Long postId) {
        postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        return commentRepository.findByPostIdOrderByIdAsc(postId).stream()
                .map(CommentResponse::from)
                .toList();
    }

    @Override
    public void delete(Long memberId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        if (!comment.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_COMMENT);
        }

        commentRepository.delete(comment);
    }

    @Override
    public void update(Long memberId, Long commentId, CommentUpdateRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        if (!comment.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_COMMENT);
        }

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
    }
}
