package com.devs.devmate.reservation.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDate;

public interface ReservationSseService {

    SseEmitter subscribe(Long memberId, Long roomId, LocalDate date);

    void send(Long roomId, LocalDate date);

}
