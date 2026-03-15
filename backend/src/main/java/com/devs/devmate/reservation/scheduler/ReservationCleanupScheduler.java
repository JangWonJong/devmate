package com.devs.devmate.reservation.scheduler;

import com.devs.devmate.reservation.entity.Reservation;
import com.devs.devmate.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationCleanupScheduler {

    private final ReservationRepository reservationRepository;

    //@Scheduled(cron = "0 * * * * *")
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupOldReservation() {
        LocalDateTime canceledCutoff = LocalDateTime.now().minusDays(30);
        LocalDate activeCutoff = LocalDate.now().minusDays(90);

        /*자동만료 테스트
        LocalDateTime canceledCutoff = LocalDateTime.now().minusHours(1);
        LocalDate activeCutoff = LocalDate.now().minusDays(1);*/

        reservationRepository.deleteByStatusAndUpdatedAtBefore(
                Reservation.Status.CANCELED,
                canceledCutoff
        );

        int deletedActiveCount = reservationRepository.deleteByStatusAndDateBefore(
                Reservation.Status.ACTIVE,
                activeCutoff
        );

        log.info("Reservation cleanup completed. canceledcCutoff={}, activeCutoff={}, deletedActiveCount={}",
                canceledCutoff, activeCutoff, deletedActiveCount);

    }
}
