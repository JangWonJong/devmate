package com.devs.devmate.inquiry.controller;


import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.inquiry.dto.InquiryCreateRequest;
import com.devs.devmate.inquiry.dto.InquiryResponse;
import com.devs.devmate.inquiry.dto.InquiryStatusUpdateRequest;
import com.devs.devmate.inquiry.service.InquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping
    public ApiResponse<Void> create(@RequestBody @Valid InquiryCreateRequest request) {

        Long memberId = SecurityUtil.currentMemberId();

        inquiryService.create(memberId, request);

        return ApiResponse.ok(null);

    }

    @GetMapping("/me")
    public ApiResponse<List<InquiryResponse>> myInquiries() {

        Long memberId = SecurityUtil.currentMemberId();

        return ApiResponse.ok(inquiryService.findMyInquiries(memberId));
    }

    @PatchMapping("/{inquiryId}/status")
    public ApiResponse<Void> updateStatus(
            @PathVariable Long inquiryId,
            @RequestBody @Valid InquiryStatusUpdateRequest request
            ) {
        inquiryService.updateStatus(inquiryId, request.getStatus());

        return ApiResponse.ok(null);
    }

    @DeleteMapping("/{inquiryId}")
    public ApiResponse<Void> delete(@PathVariable Long inquiryId) {
        Long memberId = SecurityUtil.currentMemberId();
        inquiryService.delete(memberId, inquiryId);
        return ApiResponse.ok(null);
    }
}
