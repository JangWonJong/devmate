package com.devs.devmate.like.service;

import com.devs.devmate.devlog.entity.DevLog;
import com.devs.devmate.devlog.repository.DevLogRepository;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.like.dto.DevLogLikeStatusResponse;
import com.devs.devmate.like.entity.DevLogLike;
import com.devs.devmate.like.repository.DevLogLikeRepository;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Transactional
public class DevLogLikeServiceImpl implements DevLogLikeService{
    
    private final DevLogRepository devLogRepository;
    private final DevLogLikeRepository devLogLikeRepository;
    private final MemberRepository memberRepository;


    @Override
    public void like(Long memberId, Long devLogId) {
        DevLog devLog = devLogRepository.findById(devLogId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVLOG_NOT_FOUND));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        boolean alreadyLiked =
                devLogLikeRepository.existsByDevLogIdAndMemberId(devLogId, memberId);

        if (alreadyLiked) {
            return;
        }

        devLogLikeRepository.save(DevLogLike.builder()
                .devLog(devLog)
                .member(member)
                .build());
    }

    @Override
    public void unlike(Long memberId, Long devLogId) {
        DevLog devLog = devLogRepository.findById(devLogId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVLOG_NOT_FOUND));

        memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        devLogLikeRepository.findByDevLogIdAndMemberId(devLog.getId(), memberId)
                .ifPresent(devLogLikeRepository::delete);
    }

    @Override
    public DevLogLikeStatusResponse getStatus(Long memberId, Long devLogId) {

        if (!devLogRepository.existsById(devLogId)) {
            throw new BusinessException(ErrorCode.DEVLOG_NOT_FOUND);
        }

        boolean likedByMe =
                devLogLikeRepository.existsByDevLogIdAndMemberId(devLogId, memberId);

        long likeCount = devLogLikeRepository.countByDevLogId(devLogId);

        return new DevLogLikeStatusResponse(likedByMe, likeCount);
    }

    @Override
    public long count(Long devLogId) {

        if (!devLogRepository.existsById(devLogId)) {
            throw new BusinessException(ErrorCode.DEVLOG_NOT_FOUND);
        }

        return devLogLikeRepository.countByDevLogId(devLogId);
    }
}
