package com.devs.devmate.notification.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationSseServiceImpl implements NotificationSseService{

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    private static final Long TIMEOUT = 60L * 60 * 1000;

    @Override
    public SseEmitter subscribe(Long memberId) {
        SseEmitter emitter = new SseEmitter(TIMEOUT);

        emitters.put(memberId, emitter);

        emitter.onCompletion(() -> emitters.remove(memberId));
        emitter.onTimeout(() -> emitters.remove(memberId));
        emitter.onError((e) -> emitters.remove(memberId));

        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("connected"));
        } catch (IOException e) {
            emitters.remove(memberId);
        }

        return emitter;
    }

    @Override
    public void send(Long memberId, Object data) {
        SseEmitter emitter = emitters.get(memberId);
        if (emitter == null) return;

        try {
            emitter.send(data);
        } catch (IOException e) {
            emitter.complete();
            emitters.remove(memberId);
        }
    }
}
