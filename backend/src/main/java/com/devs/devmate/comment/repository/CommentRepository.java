package com.devs.devmate.comment.repository;


import com.devs.devmate.comment.entity.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = {"member"})
    List<Comment> findByPostIdOrderByIdAsc(Long postId);

    Optional<Comment> findByPostIdAndAdoptedTrue(Long postId);
}
