package com.devs.devmate.reservation.sse;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDate;

public interface ReservationSseService {

    SseEmitter subscribe(Long memberId, Long reservationSpaceId, LocalDate date);

    void send(Long reservationSpaceId, LocalDate date);

}
