package com.devs.devmate.like.service.devlog;


import com.devs.devmate.like.dto.devlog.DevLogLikeStatusResponse;

public interface DevLogLikeService {

    void like(Long memberId, Long devLogId);

    void unlike(Long memberId, Long devLogId);

    DevLogLikeStatusResponse getStatus(Long memberId, Long devLogId);

    long count(Long devLogId);
}
