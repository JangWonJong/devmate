package com.devs.devmate.admin.repository;

import com.devs.devmate.admin.entity.ActionType;
import com.devs.devmate.admin.entity.AdminActionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdminActionLogRepository extends JpaRepository<AdminActionLog, Long> {

    List<AdminActionLog> findByTargetMemberId(Long memberId, Pageable pageable);

    @Query("""
    SELECT log
    FROM AdminActionLog log
    WHERE (:actionType IS NULL OR log.actionType = :actionType)
    AND (
        :keyword IS NULL OR
        log.description LIKE %:keyword% OR
        log.admin.nickname LIKE %:keyword% OR
        log.targetMember.nickname LIKE %:keyword% OR
        log.targetMember.email LIKE %:keyword%
    )
    ORDER BY log.createdAt DESC
    """)
    Page<AdminActionLog> searchLogs(
            @Param("actionType") ActionType actionType,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
