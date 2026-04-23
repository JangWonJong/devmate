package com.devs.devmate.admin.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class AdminDashboardSummaryResponse {

    private long dailyVisitors;
    private long totalVisitors;
    private long totalMembers;
    private long activeMembers;
    private long deletedMembers;
    private long pendingInquiries;
    private long todaySignups;
    private List<AdminRecentMemberResponse> recentMembers;
    private List<AdminRecentInquiryResponse> recentInquiries;


}
