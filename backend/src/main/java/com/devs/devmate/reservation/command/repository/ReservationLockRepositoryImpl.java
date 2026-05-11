package com.devs.devmate.reservation.command.repository;


import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ReservationLockRepositoryImpl implements ReservationLockRepository{

    private final JdbcTemplate jdbcTemplate;

    @Override
    public boolean tryLock(String key, int timeoutSeconds) {

        Integer res = jdbcTemplate.queryForObject(
                "SELECT GET_LOCK(?, ?)",
                Integer.class,
                key,
                timeoutSeconds
        );

        return res != null && res == 1;
    }

    @Override
    public void releaseLock(String key) {

        jdbcTemplate.queryForObject(
                "SELECT RELEASE_LOCK(?)",
                Integer.class,
                key
        );
    }
}
