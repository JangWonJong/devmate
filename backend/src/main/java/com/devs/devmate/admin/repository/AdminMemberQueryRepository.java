package com.devs.devmate.admin.repository;

import com.devs.devmate.admin.dto.AdminMemberResponse;
import com.devs.devmate.member.entity.MemberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminMemberQueryRepository {

    Page<AdminMemberResponse> searchMembers(
            MemberStatus status,
            String keyword,
            Pageable pageable
    );
}
