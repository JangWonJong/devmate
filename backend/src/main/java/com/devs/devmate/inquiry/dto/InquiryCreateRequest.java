package com.devs.devmate.inquiry.dto;

import com.devs.devmate.inquiry.entity.InquiryType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class InquiryCreateRequest {

    @NotNull(message = "문의 유형을 선택해주세요.")
    private InquiryType type;

    @NotBlank(message = "문의 내용을 입력해주세요.")
    private String content;

    private String guestName;

    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String guestEmail;
}
