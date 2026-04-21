package com.devs.devmate.admin.service;

import com.devs.devmate.admin.dto.AdminMemberResponse;
import com.devs.devmate.admin.repository.AdminMemberQueryRepository;
import com.devs.devmate.member.entity.MemberStatus;
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

    @Override
    public Page<AdminMemberResponse> getMembers(MemberStatus status, String keyword, Pageable pageable) {
        return adminMemberQueryRepository.searchMembers(status, keyword, pageable);
    }
}
