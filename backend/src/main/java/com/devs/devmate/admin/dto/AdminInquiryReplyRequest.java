package com.devs.devmate.admin.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminInquiryReplyRequest {

    @NotBlank
    @Size(max = 2000)
    private String adminReply;

}
