package com.devs.devmate.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AiGuideResponse {

    private String question;
    private String details;
    private String hints;
}
