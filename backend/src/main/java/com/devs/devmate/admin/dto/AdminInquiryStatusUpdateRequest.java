package com.devs.devmate.admin.dto;


import com.devs.devmate.inquiry.entity.InquiryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminInquiryStatusUpdateRequest {

    @NotNull
    private InquiryStatus status;

}
