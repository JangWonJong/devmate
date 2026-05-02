package com.devs.devmate.like.repository.devlog;

import com.devs.devmate.like.entity.devlog.DevLogLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DevLogLikeRepository extends JpaRepository<DevLogLike, Long> {

    boolean existsByDevLogIdAndMemberId(Long devLogId, Long memberId);

    Optional<DevLogLike> findByDevLogIdAndMemberId(Long devLogId, Long memberId);

    long countByDevLogId(Long devLogId);
}
