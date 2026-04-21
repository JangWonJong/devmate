package com.devs.devmate.admin.repository;


import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface AdminMemberRepository extends JpaRepository<Member, Long> {

    long countByStatus(MemberStatus status);

}
