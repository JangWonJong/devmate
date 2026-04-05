package com.devs.devmate.notification.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface NotificationSseService {

    SseEmitter subscribe(Long memberId);

    void send(Long memberId, Object data);

}
