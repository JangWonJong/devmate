package com.devs.devmate.reservation.repository;

import com.devs.devmate.reservation.entity.ReservationSpace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ReservationSpaceRepository extends JpaRepository<ReservationSpace, Long> {

    List<ReservationSpace> findByActiveTrue();
}
