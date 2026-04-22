package com.devs.devmate.admin.controller;


import com.devs.devmate.admin.dto.AdminMemberDetailResponse;
import com.devs.devmate.admin.dto.AdminMemberResponse;
import com.devs.devmate.admin.dto.AdminMemberStatusUpdateRequest;
import com.devs.devmate.admin.service.AdminMemberService;
import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.member.entity.MemberStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/members")
public class AdminMemberController {

    private final AdminMemberService adminMemberService;

    @GetMapping
    public ApiResponse<Page<AdminMemberResponse>> getMembers(
            @RequestParam(required = false)MemberStatus status,
            @RequestParam(required = false)String keyword,
            Pageable pageable
            ) {
        return ApiResponse.ok(adminMemberService.getMembers(status, keyword, pageable));
    }

    @GetMapping("/{memberId}")
    public ApiResponse<AdminMemberDetailResponse> getMemberDetail(
            @PathVariable Long memberId
    ) {
        return ApiResponse.ok(adminMemberService.getMemberDetail(memberId));
    }

    @PatchMapping("/{memberId}/status")
    public ApiResponse<Void> updateMemberStatus(
            @PathVariable Long memberId,
            @RequestBody AdminMemberStatusUpdateRequest request
    ) {
        adminMemberService.updateMemberStatus(memberId, request.getStatus());
        return ApiResponse.ok(null);
    }
}
