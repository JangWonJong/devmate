package com.devs.devmate.devlog.repository;

import com.devs.devmate.devlog.entity.DevLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DevLogRepository extends JpaRepository<DevLog, Long> {

    @EntityGraph(attributePaths = {"member", "attachments"})
    Page<DevLog> findByMemberId(Long memberId, Pageable pageable);

    @EntityGraph(attributePaths = {"member", "attachments"})
    @Query("""
        select d
        from DevLog d
        where d.member.id = :memberId
          and (
            lower(d.title) like lower(concat('%', :keyword, '%'))
            or lower(d.problem) like lower(concat('%', :keyword, '%'))
            or lower(d.solution) like lower(concat('%', :keyword, '%'))
            or lower(d.reference) like lower(concat('%', :keyword, '%'))
            or lower(d.retrospective) like lower(concat('%', :keyword, '%'))
          )
    """)
    Page<DevLog> searchMine(
            @Param("memberId") Long memberId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"member", "attachments"})
    @Query("""
        select d
        from DevLog d
        where d.member.id = :memberId
          and (
            lower(d.title) like lower(concat('%', :keyword, '%'))
            or lower(d.problem) like lower(concat('%', :keyword, '%'))
            or lower(d.solution) like lower(concat('%', :keyword, '%'))
            or lower(d.reference) like lower(concat('%', :keyword, '%'))
            or lower(d.retrospective) like lower(concat('%', :keyword, '%'))
          )
    """)
    Page<DevLog> searchByMember(
            @Param("memberId") Long memberId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

}
