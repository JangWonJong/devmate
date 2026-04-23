package com.devs.devmate.admin.repository;


import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.MemberStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface AdminMemberRepository extends JpaRepository<Member, Long> {

    long countByStatus(MemberStatus status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Member> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
