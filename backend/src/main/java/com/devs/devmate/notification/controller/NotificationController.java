package com.devs.devmate.notification.controller;


import com.devs.devmate.global.common.ApiResponse;
import com.devs.devmate.global.security.SecurityUtil;
import com.devs.devmate.notification.dto.NotificationResponse;
import com.devs.devmate.notification.dto.NotificationUnreadCountResponse;
import com.devs.devmate.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<Page<NotificationResponse>> list(Pageable pageable) {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(notificationService.list(memberId, pageable));
    }

    @GetMapping("/unread-count")
    public ApiResponse<NotificationUnreadCountResponse> unreadCount() {
        Long memberId = SecurityUtil.currentMemberId();
        return ApiResponse.ok(notificationService.getUnreadCount(memberId));
    }

    @PatchMapping("/{notificationId}/read")
    public ApiResponse<Void> markAsRead(@PathVariable Long notificationId) {
        Long memberId = SecurityUtil.currentMemberId();
        notificationService.markAsRead(memberId, notificationId);
        return ApiResponse.ok(null);
    }

    @PatchMapping("/read-all")
    public ApiResponse<Void> markAllAsRead() {
        Long memberId = SecurityUtil.currentMemberId();
        notificationService.markAllAsRead(memberId);
        return ApiResponse.ok(null);
    }

}
