package com.devs.devmate.like.service.post;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.like.dto.post.PostLikesStatusResponse;
import com.devs.devmate.like.entity.post.PostLike;
import com.devs.devmate.like.repository.post.PostLikeRepository;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.notification.service.NotificationService;
import com.devs.devmate.post.entity.Post;
import com.devs.devmate.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostLikeServiceImpl implements PostLikeService{

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public void like(Long memberId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        boolean alreadyLiked = postLikeRepository.existsByPostIdAndMemberId(postId, memberId);

        if (alreadyLiked) {
            return;
        }

        postLikeRepository.save(PostLike.builder()
                        .post(post)
                        .member(member)
                        .build());

        Long receiverId = post.getMember().getId();
        if (!receiverId.equals(memberId)) {
            notificationService.createPostLiked(
                    receiverId,
                    memberId,
                    post.getId(),
                    post.getTitle()
            );
        }
    }

    @Override
    @Transactional
    public void unlike(Long memberId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        postLikeRepository.findByPostIdAndMemberId(post.getId(), memberId)
                .ifPresent(postLikeRepository::delete);
    }

    @Override
    public PostLikesStatusResponse getStatus(Long memberId, Long postId) {

        if (!postRepository.existsById(postId)) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        boolean likedByMe = postLikeRepository.existsByPostIdAndMemberId(postId, memberId);
        long likeCount = postLikeRepository.countByPostId(postId);

        return new PostLikesStatusResponse(likedByMe, likeCount);
    }

    @Override
    public long count(Long postId) {

        if (!postRepository.existsById(postId)) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }
        return postLikeRepository.countByPostId(postId);
    }
}
