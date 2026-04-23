package com.devs.devmate.admin.service;

import com.devs.devmate.admin.dto.dashboard.AdminDashboardSummaryResponse;
import com.devs.devmate.admin.dto.dashboard.AdminRecentInquiryResponse;
import com.devs.devmate.admin.dto.dashboard.AdminRecentMemberResponse;
import com.devs.devmate.admin.repository.AdminMemberRepository;
import com.devs.devmate.analytics.dto.AnalyticsSummaryResponse;
import com.devs.devmate.analytics.service.AnalyticsService;
import com.devs.devmate.inquiry.entity.InquiryStatus;
import com.devs.devmate.inquiry.repository.InquiryRepository;
import com.devs.devmate.member.entity.MemberStatus;
import com.devs.devmate.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService{

    private final AnalyticsService analyticsService;
    private final AdminMemberRepository adminMemberRepository;
    private final InquiryRepository inquiryRepository;

    @Override
    public AdminDashboardSummaryResponse getSummary() {

        AnalyticsSummaryResponse analytics = analyticsService.getSummary();

        long totalMembers = adminMemberRepository.count();
        long activeMembers = adminMemberRepository.countByStatus(MemberStatus.ACTIVE);
        long deletedMembers = adminMemberRepository.countByStatus(MemberStatus.DELETED);
        long pendingInquiries =
                inquiryRepository.countByStatus(InquiryStatus.RECEIVED)
                        + inquiryRepository.countByStatus(InquiryStatus.IN_PROGRESS);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        long todaySignups = adminMemberRepository.countByCreatedAtBetween(startOfDay, endOfDay);


        List<AdminRecentMemberResponse> recentMembers = adminMemberRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5))
                .stream()
                .map(AdminRecentMemberResponse::from)
                .toList();

        List<AdminRecentInquiryResponse> recentInquiries = inquiryRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5))
                .stream()
                .map(AdminRecentInquiryResponse::from)
                .toList();

        return new AdminDashboardSummaryResponse(
                analytics.dailyVisitors(),
                analytics.totalVisitors(),
                totalMembers,
                activeMembers,
                deletedMembers,
                pendingInquiries,
                todaySignups,
                recentMembers,
                recentInquiries
        );
    }
}
