package com.devs.devmate.reservation.space.repository;

import com.devs.devmate.reservation.space.entity.ReservationSpace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface ReservationSpaceRepository extends JpaRepository<ReservationSpace, Long> {

    List<ReservationSpace> findByActiveTrue();

    Optional<ReservationSpace> findByExternalPlaceId(String externalPlaceId);

    Optional<ReservationSpace> findByName(String name);
}
