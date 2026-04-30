package com.devs.devmate.admin.service;

import com.devs.devmate.admin.dto.log.AdminActionLogResponse;
import com.devs.devmate.admin.entity.ActionType;
import com.devs.devmate.member.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminActionLogService {

    void save(Member admin, Member targetMember, ActionType actionType, String description);

    Page<AdminActionLogResponse> searchLogs(ActionType actionType, String keyword, Pageable pageable);
}
