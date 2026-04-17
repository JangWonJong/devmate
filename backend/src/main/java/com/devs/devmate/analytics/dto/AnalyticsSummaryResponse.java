package com.devs.devmate.analytics.dto;

public record AnalyticsSummaryResponse(
        long dailyVisitors,
        long totalVisitors
) {
}
