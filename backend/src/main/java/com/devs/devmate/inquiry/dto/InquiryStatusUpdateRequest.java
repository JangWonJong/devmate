package com.devs.devmate.inquiry.dto;

import com.devs.devmate.inquiry.entity.InquiryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class InquiryStatusUpdateRequest {

    @NotNull
    private InquiryStatus status;
}
