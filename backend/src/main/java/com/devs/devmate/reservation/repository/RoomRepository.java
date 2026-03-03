package com.devs.devmate.reservation.repository;

import com.devs.devmate.reservation.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {

}
