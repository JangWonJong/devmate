package com.devs.devmate.admin.controller;


import com.devs.devmate.admin.dto.log.AdminActionLogResponse;
import com.devs.devmate.admin.entity.ActionType;
import com.devs.devmate.admin.service.AdminActionLogService;
import com.devs.devmate.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/action-logs")
public class AdminActionLogController {

    private final AdminActionLogService adminActionLogService;

    @GetMapping
    public ApiResponse<Page<AdminActionLogResponse>> search(
            @RequestParam(required = false)ActionType actionType,
            @RequestParam(required = false) String keyword,
            Pageable pageable
            ) {
        return ApiResponse.ok(adminActionLogService.searchLogs(actionType, keyword, pageable));
    }
}
