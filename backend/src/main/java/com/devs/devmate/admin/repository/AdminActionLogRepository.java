package com.devs.devmate.admin.repository;

import com.devs.devmate.admin.entity.AdminActionLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminActionLogRepository extends JpaRepository<AdminActionLog, Long> {

    List<AdminActionLog> findByTargetMemberId(Long memberId, Pageable pageable);
}
