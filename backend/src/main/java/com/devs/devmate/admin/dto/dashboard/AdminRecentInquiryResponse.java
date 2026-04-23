package com.devs.devmate.admin.dto.dashboard;

import com.devs.devmate.inquiry.entity.Inquiry;
import com.devs.devmate.inquiry.entity.InquiryStatus;
import com.devs.devmate.inquiry.entity.InquiryType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminRecentInquiryResponse {

    private Long id;
    private String memberNickname;
    private InquiryType type;
    private InquiryStatus status;
    private String content;
    private LocalDateTime createdAt;

    public static AdminRecentInquiryResponse from(Inquiry inquiry) {
        return AdminRecentInquiryResponse.builder()
                .id(inquiry.getId())
                .memberNickname(inquiry.getMember().getNickname())
                .type(inquiry.getType())
                .status(inquiry.getStatus())
                .content(inquiry.getContent())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }

}
