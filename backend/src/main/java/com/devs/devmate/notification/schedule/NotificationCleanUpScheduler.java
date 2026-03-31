package com.devs.devmate.notification.schedule;


import com.devs.devmate.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationCleanUpScheduler {

    private final NotificationRepository notificationRepository;

    //@Scheduled(cron = "0 * * * * *")
    @Scheduled(cron = "0 30 3 * * *")
    @Transactional
    public void cleanupOldNotifications() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);

        int deletedCount = notificationRepository.deleteByCreatedAtBefore(cutoff);

        log.info("Notification cleanup completed. cutoff={}, deletedCount={}",
                cutoff, deletedCount);
    }
}
