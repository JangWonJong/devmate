package com.devs.devmate.analytics.controller;


import com.devs.devmate.analytics.dto.AnalyticsSummaryResponse;
import com.devs.devmate.analytics.service.AnalyticsService;
import com.devs.devmate.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @PostMapping("/visit")
    public ApiResponse<Void> countVisit() {
        analyticsService.countVisit();
        return ApiResponse.ok();
    }

    @GetMapping("/summary")
    public ApiResponse<AnalyticsSummaryResponse> summary() {
        return ApiResponse.ok(analyticsService.getSummary());
    }
}
