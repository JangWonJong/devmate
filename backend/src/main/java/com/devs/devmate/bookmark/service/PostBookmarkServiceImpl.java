package com.devs.devmate.bookmark.service;

import com.devs.devmate.bookmark.dto.PostBookmarkStatusResponse;
import com.devs.devmate.bookmark.entity.PostBookmark;
import com.devs.devmate.bookmark.repository.PostBookmarkRepository;
import com.devs.devmate.comment.repository.CommentRepository;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.like.repository.PostLikeRepository;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.post.dto.PostResponse;
import com.devs.devmate.post.entity.Post;
import com.devs.devmate.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostBookmarkServiceImpl implements PostBookmarkService{

    private final PostBookmarkRepository postBookmarkRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;


    private PostResponse toResponse(Post post) {
        long likeCount = postLikeRepository.countByPostId(post.getId());
        long commentCount = commentRepository.countByPostId(post.getId());
        return PostResponse.from(post, likeCount, commentCount);
    }

    @Override
    @Transactional
    public void bookmark(Long memberId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        boolean alreadyBookmarked = postBookmarkRepository.existsByPostIdAndMemberId(postId, memberId);

        if (alreadyBookmarked) {
            return;
        }

        postBookmarkRepository.save(
                PostBookmark.builder()
                        .post(post)
                        .member(member)
                        .build()
        );
    }

    @Override
    @Transactional
    public void unbookmark(Long memberId, Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        postBookmarkRepository.findByPostIdAndMemberId(postId, memberId)
                .ifPresent(postBookmarkRepository::delete);
    }

    @Override
    public PostBookmarkStatusResponse getStatus(Long memberId, Long postId) {

        if (!postRepository.existsById(postId)) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        boolean bookmarkedByMe = postBookmarkRepository.existsByPostIdAndMemberId(postId, memberId);
        long bookmarkCount = postBookmarkRepository.countByPostId(postId);

        return new PostBookmarkStatusResponse(bookmarkedByMe, bookmarkCount);
    }

    @Override
    public long count(Long postId) {

        if (!postRepository.existsById(postId)) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }
        return postBookmarkRepository.countByPostId(postId);
    }

    @Override
    public List<PostResponse> listBookmarkedPosts(Long memberId) {
        return postBookmarkRepository.findBookmarkedPostsByMemberId(memberId).stream()
                .map(this::toResponse)
                .toList();
    }
}
