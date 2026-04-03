package com.devs.devmate.ai.controller;

import com.devs.devmate.ai.dto.AiGuideRequest;
import com.devs.devmate.ai.dto.AiGuideResponse;
import com.devs.devmate.ai.service.AiService;
import com.devs.devmate.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    @PostMapping("/guide")
    public ApiResponse<AiGuideResponse> guide(@RequestBody @Valid AiGuideRequest request) {
        return ApiResponse.ok(aiService.guideQuestion(request.getMessage()));
    }
}
