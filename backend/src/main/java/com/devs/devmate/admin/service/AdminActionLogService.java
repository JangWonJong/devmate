package com.devs.devmate.admin.service;

import com.devs.devmate.admin.entity.ActionType;
import com.devs.devmate.member.entity.Member;

public interface AdminActionLogService {

    void save(Member admin, Member targetMember, ActionType actionType, String description);
}
