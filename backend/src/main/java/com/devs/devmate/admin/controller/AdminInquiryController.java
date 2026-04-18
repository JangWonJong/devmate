package com.devs.devmate.admin.controller;


import com.devs.devmate.admin.dto.AdminInquiryDetailResponse;
import com.devs.devmate.admin.dto.AdminInquiryListResponse;
import com.devs.devmate.admin.dto.AdminInquiryReplyRequest;
import com.devs.devmate.admin.dto.AdminInquiryStatusUpdateRequest;
import com.devs.devmate.admin.service.AdminInquiryService;
import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/inquiries")
public class AdminInquiryController {

    private final AdminInquiryService adminInquiryService;

    @GetMapping
    public ApiResponse<List<AdminInquiryListResponse>> findAll(){
        return ApiResponse.ok(adminInquiryService.findAll());
    }

    @GetMapping("/{inquiryId}")
    public ApiResponse<AdminInquiryDetailResponse> findDetail(
            @PathVariable Long inquiryId
    ) {
        return ApiResponse.ok(adminInquiryService.findDetail(inquiryId));
    }

    @PatchMapping("/{inquiryId}/status")
    public ApiResponse<Void> updateStatus(
            @PathVariable Long inquiryId,
            @RequestBody @Valid AdminInquiryStatusUpdateRequest request
    ) {
        Long adminId = SecurityUtil.currentMemberId();

        adminInquiryService.updateStatus(
                adminId,
                inquiryId,
                request.getStatus()
        );

        return ApiResponse.ok(null);
    }

    @PatchMapping("/{inquiryId}/reply")
    public ApiResponse<Void> reply(
            @PathVariable Long inquiryId,
            @RequestBody @Valid AdminInquiryReplyRequest request
    ) {
        Long adminId = SecurityUtil.currentMemberId();

        adminInquiryService.reply(
                adminId,
                inquiryId,
                request.getAdminReply()
        );

        return ApiResponse.ok(null);
    }

}
