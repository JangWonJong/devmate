package com.devs.devmate.inquiry.dto;

import com.devs.devmate.inquiry.entity.Inquiry;
import com.devs.devmate.inquiry.entity.InquiryStatus;
import com.devs.devmate.inquiry.entity.InquiryType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class InquiryResponse {

    private Long id;
    private InquiryType type;
    private String content;
    private InquiryStatus status;
    private String adminReply;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    private String guestName;
    private String guestEmail;
    private String memberNickname;
    private boolean isMember;


    public static InquiryResponse from(Inquiry inquiry) {
        return new InquiryResponse(
                inquiry.getId(),
                inquiry.getType(),
                inquiry.getContent(),
                inquiry.getStatus(),
                inquiry.getAdminReply(),
                inquiry.getCreatedAt(),
                inquiry.getProcessedAt(),
                inquiry.getGuestName(),
                inquiry.getGuestEmail(),
                inquiry.getMember() != null ? inquiry.getMember().getNickname() : null,
                inquiry.getMember() != null
        );
    }
}
