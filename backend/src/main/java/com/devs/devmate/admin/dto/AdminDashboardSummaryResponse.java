package com.devs.devmate.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminDashboardSummaryResponse {

    private long dailyVisitors;
    private long totalVisitors;
    private long totalMembers;
    private long activeMembers;
    private long deletedMembers;
    private long pendingInquiries;

}
