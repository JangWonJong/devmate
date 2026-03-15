package com.devs.devmate.reservation.repository;

import com.devs.devmate.reservation.entity.Reservation;
import com.devs.devmate.reservation.entity.Reservation.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("""
        select count(r) > 0 from Reservation r
            where r.room.id = :roomId
                and r.date = :date
                and r.status = :active
                and r.startTime < :endTime
                and r.endTime > :startTime
    """)
    boolean existsRoomOverlap(@Param("roomId") Long roomId,
                          @Param("date") LocalDate date,
                          @Param("startTime")LocalTime startTime,
                          @Param("endTime") LocalTime endTime,
                          @Param("active")Status active);


    @Query("""
         select count(r) > 0 from Reservation r
            where r.member.id = :memberId
                 and r.date = :date
                 and r.status = :active
                 and r.startTime < :endTime
                 and r.endTime > :startTime
    """)
    boolean existsMemberOverlap(
            @Param("memberId") Long memberId,
            @Param("date") LocalDate date,
            @Param("startTime")LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("active")Status active);


    @EntityGraph(attributePaths = {"room", "member"})
    Page<Reservation> findByMemberIdAndStatus(Long memberId, Status status, Pageable pageable);

    @EntityGraph(attributePaths = {"room", "member"})
    Page<Reservation> findByRoomIdAndDateAndStatus(Long roomId, LocalDate date, Status status, Pageable pageable);

    @EntityGraph(attributePaths = {"room", "member"})
    Page<Reservation> findByDateAndStatus(LocalDate date, Status status, Pageable pageable);

    @EntityGraph(attributePaths = {"room", "member", "study"})
    Page<Reservation> findByStudyIdAndStatus(Long studyId, Status status, Pageable pageable);

    @EntityGraph(attributePaths = {"room", "member"})
    Page<Reservation> findByMemberIdAndDateAndStatus(
            Long memberId, LocalDate date, Reservation.Status status, Pageable pageable
    );

    List<Reservation> findByMemberIdAndDateAndStatus(
            Long memberId,
            LocalDate date,
            Reservation.Status status
    );

    long countByMemberIdAndDateAndStatus(Long memberId, LocalDate date, Status status);

    void deleteAllByStudyId(Long studyId);

}
