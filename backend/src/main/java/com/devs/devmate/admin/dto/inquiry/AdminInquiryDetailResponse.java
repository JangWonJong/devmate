package com.devs.devmate.admin.dto.inquiry;


import com.devs.devmate.inquiry.entity.Inquiry;
import com.devs.devmate.inquiry.entity.InquiryStatus;
import com.devs.devmate.inquiry.entity.InquiryType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminInquiryDetailResponse {

    private Long id;
    private Long memberId;
    private String memberNickname;
    private InquiryType type;
    private InquiryStatus status;
    private String content;
    private String adminReply;
    private String processedByNickname;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
    private LocalDateTime updatedAt;

    public static AdminInquiryDetailResponse from(Inquiry inquiry) {
        return AdminInquiryDetailResponse.builder()
                .id(inquiry.getId())
                .memberId(inquiry.getMember().getId())
                .memberNickname(inquiry.getMember().getNickname())
                .type(inquiry.getType())
                .status(inquiry.getStatus())
                .content(inquiry.getContent())
                .adminReply(inquiry.getAdminReply())
                .processedByNickname(
                        inquiry.getProcessedBy() != null ? inquiry.getProcessedBy().getNickname() : null
                )
                .createdAt(inquiry.getCreatedAt())
                .processedAt(inquiry.getProcessedAt())
                .updatedAt(inquiry.getUpdatedAt())
                .build();
    }

}
