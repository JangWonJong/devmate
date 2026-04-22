package com.devs.devmate.admin.service;

import com.devs.devmate.admin.dto.AdminMemberDetailResponse;
import com.devs.devmate.admin.dto.AdminMemberResponse;
import com.devs.devmate.admin.repository.AdminMemberQueryRepository;
import com.devs.devmate.admin.repository.AdminMemberRepository;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.MemberStatus;
import com.devs.devmate.member.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminMemberServiceImpl implements AdminMemberService{

    private final AdminMemberQueryRepository adminMemberQueryRepository;
    private final AdminMemberRepository adminMemberRepository;

    @Override
    public Page<AdminMemberResponse> getMembers(MemberStatus status, String keyword, Pageable pageable) {
        return adminMemberQueryRepository.searchMembers(status, keyword, pageable);
    }

    @Override
    public AdminMemberDetailResponse getMemberDetail(Long memberId) {

        Member member = adminMemberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        return AdminMemberDetailResponse.from(member);
    }

    @Override
    @Transactional
    public void updateMemberStatus(Long memberId, MemberStatus status) {

        Member member = adminMemberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (status == MemberStatus.DELETED && member.isDeleted()) {
            throw new BusinessException(ErrorCode.MEMBER_ALREADY_DELETED);
        }

        if (status == MemberStatus.ACTIVE) {
            member.restore();
            return;
        }

        if (status == MemberStatus.DELETED) {
            member.withdraw();
            return;
        }

        throw new BusinessException(ErrorCode.INVALID_MEMBER_STATUS_CHANGE);
    }

    @Override
    @Transactional
    public void updateMemberRole(Long actorMemberId, Long targetMemberId, Role role) {
        Member member = adminMemberRepository.findById(targetMemberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (role == null || member.getRole() == role) {
            throw new BusinessException(ErrorCode.INVALID_MEMBER_ROLE_CHANGE);
        }

        if (actorMemberId.equals(targetMemberId) && role == Role.USER) {
            throw new BusinessException(ErrorCode.SELF_ROLE_CHANGE_NOT_ALLOWED);
        }
        member.changeRole(role);
    }
}
