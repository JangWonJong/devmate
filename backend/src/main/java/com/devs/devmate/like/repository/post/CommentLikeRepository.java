package com.devs.devmate.like.repository.post;

import com.devs.devmate.like.entity.post.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {

    boolean existsByCommentIdAndMemberId(Long commentId, Long memberId);

    Optional<CommentLike> findByCommentIdAndMemberId(Long commentId, Long memberId);

    long countByCommentId(Long commentId);

    List<CommentLike> findAllByCommentIdInAndMemberId(List<Long> commentIds, Long memberId);

    @Query("""
    SELECT count(cl)
        from CommentLike cl
            where cl.comment.member.id = :memberId
    """)
    long countReceivedCommentLikes(@Param("memberId") Long memberId);

    void deleteAllByCommentId(Long commentId);

    void deleteAllByCommentIdIn(List<Long> commentIds);
}
