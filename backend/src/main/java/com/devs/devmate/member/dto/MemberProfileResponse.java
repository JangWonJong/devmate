package com.devs.devmate.member.dto;


import com.devs.devmate.member.entity.MemberStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class MemberProfileResponse {

    private Long id;
    private String nickname;
    private String bio;
    private String profileImageUrl;
    private MemberStatus status;
    private List<ProfileLinkResponse> links;
    private long receivedLikeCount;
    private long profileLikeCount;

}
