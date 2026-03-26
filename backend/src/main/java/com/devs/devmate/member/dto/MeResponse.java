package com.devs.devmate.member.dto;

import com.devs.devmate.member.entity.MemberStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class MeResponse {
    private Long id;
    private String email;
    private String name;
    private String nickname;
    private String phone;
    private String bio;
    private String profileImageUrl;
    private MemberStatus status;
    private List<ProfileLinkResponse> links;
}
