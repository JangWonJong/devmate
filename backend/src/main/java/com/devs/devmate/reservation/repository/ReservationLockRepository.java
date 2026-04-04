package com.devs.devmate.reservation.repository;

public interface ReservationLockRepository {

    boolean tryLock(String key, int timeoutSeconds);

    void releaseLock(String key);

}
