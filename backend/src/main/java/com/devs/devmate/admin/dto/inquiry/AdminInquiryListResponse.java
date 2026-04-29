package com.devs.devmate.admin.dto.inquiry;


import com.devs.devmate.inquiry.entity.Inquiry;
import com.devs.devmate.inquiry.entity.InquiryStatus;
import com.devs.devmate.inquiry.entity.InquiryType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminInquiryListResponse {

    private Long id;
    private String memberNickname;
    private InquiryType type;
    private InquiryStatus status;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    private String guestName;
    private String guestEmail;
    private boolean member;

    public static AdminInquiryListResponse from(Inquiry inquiry) {
        return AdminInquiryListResponse.builder()
                .id(inquiry.getId())
                .memberNickname(inquiry.getMember() != null ? inquiry.getMember().getNickname() : null)
                .guestName(inquiry.getGuestName())
                .guestEmail(inquiry.getGuestEmail())
                .member(inquiry.getMember() != null)
                .type(inquiry.getType())
                .status(inquiry.getStatus())
                .content(inquiry.getContent())
                .createdAt(inquiry.getCreatedAt())
                .processedAt(inquiry.getProcessedAt())
                .build();
    }
}
