package com.devs.devmate.admin.repository;

import com.devs.devmate.admin.entity.AdminMemberManagement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminMemberManagementRepository extends JpaRepository<AdminMemberManagement, Long> {

    Optional<AdminMemberManagement> findByMemberId(Long memberId);
}
