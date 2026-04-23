package com.devs.devmate.admin.controller;


import com.devs.devmate.admin.dto.dashboard.AdminDashboardSummaryResponse;
import com.devs.devmate.admin.service.AdminDashboardService;
import com.devs.devmate.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/summary")
    public ApiResponse<AdminDashboardSummaryResponse> getSummary(){
        return ApiResponse.ok(adminDashboardService.getSummary());
    }
}
