package com.devs.devmate.admin.dto.member;

import com.devs.devmate.member.entity.MemberStatus;
import com.devs.devmate.member.entity.Role;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminMemberUpdateRequest {

    private MemberStatus status;

    private Role role;

}
