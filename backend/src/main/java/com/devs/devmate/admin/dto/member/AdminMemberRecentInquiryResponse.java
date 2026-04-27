package com.devs.devmate.admin.dto.member;

import com.devs.devmate.inquiry.entity.Inquiry;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminMemberRecentInquiryResponse {

    private Long id;
    private String content;
    private LocalDateTime createdAt;

    public static AdminMemberRecentInquiryResponse from(Inquiry inquiry) {
        return AdminMemberRecentInquiryResponse.builder()
                .id(inquiry.getId())
                .content(inquiry.getContent())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}
