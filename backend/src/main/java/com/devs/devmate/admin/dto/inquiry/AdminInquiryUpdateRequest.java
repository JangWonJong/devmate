package com.devs.devmate.admin.dto.inquiry;


import com.devs.devmate.inquiry.entity.InquiryStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminInquiryUpdateRequest {

    private String adminReply;
    private InquiryStatus status;
}
