package com.devs.devmate.like.repository.devlog;

import com.devs.devmate.like.entity.devlog.DevLogCommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DevLogCommentLikeRepository extends JpaRepository<DevLogCommentLike, Long> {

    boolean existsByCommentIdAndMemberId(Long commentId, Long memberId);

    Optional<DevLogCommentLike> findByCommentIdAndMemberId(Long commentId, Long memberId);

    long countByCommentId(Long commentId);

    List<DevLogCommentLike> findAllByCommentIdInAndMemberId(List<Long> commentIds, Long memberId);

    void deleteAllByCommentId(Long commentId);

    void deleteAllByCommentIdIn(List<Long> commentIds);
}
