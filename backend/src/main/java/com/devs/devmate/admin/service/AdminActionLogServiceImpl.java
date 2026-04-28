package com.devs.devmate.admin.service;

import com.devs.devmate.admin.entity.ActionType;
import com.devs.devmate.admin.entity.AdminActionLog;
import com.devs.devmate.admin.repository.AdminActionLogRepository;
import com.devs.devmate.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminActionLogServiceImpl implements AdminActionLogService{

    private final AdminActionLogRepository adminActionLogRepository;

    @Override
    public void save(Member admin, Member targetMember, ActionType actionType, String description) {
        AdminActionLog log = AdminActionLog.builder()
                .admin(admin)
                .targetMember(targetMember)
                .actionType(actionType)
                .description(description)
                .build();

        adminActionLogRepository.save(log);
    }
}
