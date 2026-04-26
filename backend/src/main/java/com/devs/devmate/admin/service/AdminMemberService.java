package com.devs.devmate.admin.service;

import com.devs.devmate.admin.dto.member.AdminMemberDetailResponse;
import com.devs.devmate.admin.dto.member.AdminMemberResponse;
import com.devs.devmate.member.entity.MemberStatus;
import com.devs.devmate.member.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminMemberService {

    Page<AdminMemberResponse> getMembers(MemberStatus status, String keyword, Pageable pageable);

    AdminMemberDetailResponse getMemberDetail(Long memberId);

    void updateMemberStatus(Long memberId, MemberStatus status);

    void updateMemberRole(Long actorMemberId, Long targetMemberId, Role role);

    void updateAdminMemo(Long adminId, Long memberId, String adminMemo);
}
