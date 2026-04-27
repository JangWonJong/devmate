package com.devs.devmate.admin.dto.member;


import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.MemberStatus;
import com.devs.devmate.member.entity.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class AdminMemberDetailResponse {

    private Long id;
    private String name;
    private String nickname;
    private String email;
    private String phone;
    private String bio;
    private String profileImageUrl;
    private Role role;
    private MemberStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String adminMemo;

    private long postCount;
    private long commentCount;
    private long inquiryCount;
    private long reservationCount;

    private List<AdminMemberRecentPostResponse> recentPosts;
    private List<AdminMemberRecentInquiryResponse> recentInquiries;
    private List<AdminMemberRecentReservationResponse> recentReservations;

    public static AdminMemberDetailResponse from(
            Member member,
            String adminMemo,
            long postCount,
            long commentCount,
            long inquiryCount,
            long reservationCount,
            List<AdminMemberRecentPostResponse> recentPosts,
            List<AdminMemberRecentInquiryResponse> recentInquiries,
            List<AdminMemberRecentReservationResponse> recentReservations
            ) {
        return AdminMemberDetailResponse.builder()
                .id(member.getId())
                .name(member.getName())
                .nickname(member.getNickname())
                .email(member.getEmail())
                .phone(member.getPhone())
                .bio(member.getBio())
                .profileImageUrl(member.getProfileImageUrl())
                .role(member.getRole())
                .status(member.getStatus())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .adminMemo(adminMemo)
                .postCount(postCount)
                .commentCount(commentCount)
                .inquiryCount(inquiryCount)
                .reservationCount(reservationCount)
                .recentPosts(recentPosts)
                .recentInquiries(recentInquiries)
                .recentReservations(recentReservations)
                .build();
    }


}
