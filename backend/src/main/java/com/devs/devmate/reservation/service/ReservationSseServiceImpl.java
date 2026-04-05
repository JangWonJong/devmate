package com.devs.devmate.reservation.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class ReservationSseServiceImpl implements ReservationSseService{

    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    private static final Long TIMEOUT = 60L * 60 * 1000;

    private String key(Long roomId, LocalDate date) {
        return "room:" + roomId + ":date:" + date;
    }

    @Override
    public SseEmitter subscribe(Long memberId, Long roomId, LocalDate date) {

        String key = key(roomId, date);

        SseEmitter emitter = new SseEmitter(TIMEOUT);

        emitters.computeIfAbsent(key, k -> new CopyOnWriteArrayList<>())
                .add(emitter);

        emitter.onCompletion(() -> emitters.getOrDefault(key, List.of()).remove(emitter));
        emitter.onTimeout(() -> emitters.getOrDefault(key, List.of()).remove(emitter));
        emitter.onError(e -> emitters.getOrDefault(key, List.of()).remove(emitter));

        try {
            emitter.send("connected");
        } catch (IOException e) {
            emitters.getOrDefault(key, List.of()).remove(emitter);
        }

        return emitter;
    }

    @Override
    public void send(Long roomId, LocalDate date) {
        String key = key(roomId, date);

        List<SseEmitter> list = emitters.get(key);
        if (list == null) return;

        for (SseEmitter emitter : list) {
            try {
                emitter.send("updated");
            } catch (IOException e) {
                emitter.complete();
            }
        }
    }
}
