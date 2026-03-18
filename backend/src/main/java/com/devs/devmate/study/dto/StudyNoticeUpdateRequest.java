package com.devs.devmate.study.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StudyNoticeUpdateRequest(
        @NotBlank(message = "스터디 소개를 입력해주세요.")
        @Size(max = 1000, message = "스터디 소개는 1000자 이하여야 합니다.")
        String notice
) {
}
