package com.devs.devmate.like.repository;

import com.devs.devmate.like.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    boolean existsByPostIdAndMemberId(Long postId, Long memberId);

    long countByPostId(Long postId);

    Optional<PostLike> findByPostIdAndMemberId(Long postId, Long memberId);

}
