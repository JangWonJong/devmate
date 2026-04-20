package com.devs.devmate.analytics.service;

import com.devs.devmate.analytics.dto.AnalyticsSummaryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService{

    private static final String TOTAL_VISITORS_KEY = "analytics:visitors:total";
    private static final String DAILY_VISITORS_KEY_PREFIX = "analytics:visitors:daily:";

    private final StringRedisTemplate stringRedisTemplate;

    private String dailyKey() {
        return DAILY_VISITORS_KEY_PREFIX + LocalDate.now();
    }

    @Override
    public void countVisit() {

        String dailyKey = dailyKey();

        Long dailyCount = stringRedisTemplate.opsForValue().increment(dailyKey);
        stringRedisTemplate.opsForValue().increment(TOTAL_VISITORS_KEY);

        if (dailyCount != null && dailyCount == 1L) {
            stringRedisTemplate.expire(dailyKey, Duration.ofDays(7));
        }

    }

    @Override
    public AnalyticsSummaryResponse getSummary() {
        try{

            String dailyKey = dailyKey();

            String dailyValue = stringRedisTemplate.opsForValue().get(dailyKey);
            String totalValue = stringRedisTemplate.opsForValue().get(TOTAL_VISITORS_KEY);

            long dailyVisitors = dailyValue == null ? 0L : Long.parseLong(dailyValue);
            long totalVisitors = totalValue == null ? 0L : Long.parseLong(totalValue);

            return new AnalyticsSummaryResponse(dailyVisitors, totalVisitors);
        } catch (Exception e) {
            log.warn("방문자 통계 조회 실패 - Redis fallback 적용", e);
            return new AnalyticsSummaryResponse(0L, 0L);
        }
    }
}
