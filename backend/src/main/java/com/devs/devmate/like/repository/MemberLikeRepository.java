package com.devs.devmate.like.repository;


import com.devs.devmate.like.entity.MemberLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberLikeRepository extends JpaRepository<MemberLike, Long> {

    boolean existsByTargetMemberIdAndActorMemberId(Long targetMemberId, Long actorMemberId);

    Optional<MemberLike> findByTargetMemberIdAndActorMemberId(Long targetMemberId, Long actorMemberId);

    long countByTargetMemberId(Long targetMemberId);
}
