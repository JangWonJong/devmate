package com.devs.devmate.analytics.service;

import com.devs.devmate.analytics.dto.AnalyticsSummaryResponse;

public interface AnalyticsService {

    void countVisit();

    AnalyticsSummaryResponse getSummary();
}
