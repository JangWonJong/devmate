package com.devs.devmate.comment.repository;


import com.devs.devmate.comment.entity.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = {"member"})
    List<Comment> findByPostIdOrderByIdAsc(Long postId);

    Optional<Comment> findByPostIdAndAdoptedTrue(Long postId);

    void deleteAllByPostId(Long postId);

    List<Comment> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    @Query("select c.id from Comment c where c.post.id = :postId")
    List<Long> findIdsByPostId(@Param("postId") Long postId);

    Long countByPostId(Long postId);

    long countByMemberId(Long memberId);
}
