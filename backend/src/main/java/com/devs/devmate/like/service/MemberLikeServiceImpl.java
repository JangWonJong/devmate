package com.devs.devmate.like.service;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.like.dto.MemberLikeStatusResponse;
import com.devs.devmate.like.entity.MemberLike;
import com.devs.devmate.like.repository.MemberLikeRepository;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberLikeServiceImpl implements MemberLikeService{

    private final MemberLikeRepository memberLikeRepository;
    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public void like(Long actorMemberId, Long targetMemberId) {
        if (actorMemberId.equals(targetMemberId)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        Member actor = memberRepository.findById(actorMemberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        Member target = memberRepository.findById(targetMemberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (target.isDeleted()) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        boolean alreadyLiked =
                memberLikeRepository.existsByTargetMemberIdAndActorMemberId(targetMemberId, actorMemberId);

        if (alreadyLiked) {
            return;
        }

        memberLikeRepository.save(
                MemberLike.builder()
                        .targetMember(target)
                        .actorMember(actor)
                        .build()
        );

    }


    @Override
    @Transactional
    public void unlike(Long actorMemberId, Long targetMemberId) {
        if (actorMemberId.equals(targetMemberId)) {
            return;
        }

        memberRepository.findById(targetMemberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        memberLikeRepository.findByTargetMemberIdAndActorMemberId(targetMemberId, actorMemberId)
                .ifPresent(memberLikeRepository::delete);
    }

    @Override
    public MemberLikeStatusResponse getStatus(Long actorMemberId, Long targetMemberId) {
        memberRepository.findById(targetMemberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        boolean likedByMe =
                memberLikeRepository.existsByTargetMemberIdAndActorMemberId(targetMemberId, actorMemberId);

        long likeCount = memberLikeRepository.countByTargetMemberId(targetMemberId);

        return new MemberLikeStatusResponse(likedByMe, likeCount);
    }
}
