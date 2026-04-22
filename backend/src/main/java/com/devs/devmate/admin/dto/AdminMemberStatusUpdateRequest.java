package com.devs.devmate.admin.dto;

import com.devs.devmate.member.entity.MemberStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminMemberStatusUpdateRequest {

    private MemberStatus status;

}
