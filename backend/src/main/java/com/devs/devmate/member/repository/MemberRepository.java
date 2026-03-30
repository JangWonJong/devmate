package com.devs.devmate.member.repository;

import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByNickname(String nickname);

    boolean existsByNicknameAndIdNot(String nickname, Long memberId);

    Optional<Member> findByEmailAndStatus(String email, MemberStatus status);

    List<Member> findAllByStatus(MemberStatus status);
}
