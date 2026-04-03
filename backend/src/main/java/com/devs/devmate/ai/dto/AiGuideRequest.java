package com.devs.devmate.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AiGuideRequest {

    @NotBlank(message = "질문을 입력해주세요.")
    private String message;
}
