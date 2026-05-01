package com.devs.devmate.devlog.repository;

import com.devs.devmate.devlog.entity.DevLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DevLogRepository extends JpaRepository<DevLog, Long> {

    Page<DevLog> findByMemberId(Long memberId, Pageable pageable);
}
