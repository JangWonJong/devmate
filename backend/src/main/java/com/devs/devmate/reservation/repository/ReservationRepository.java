package com.devs.devmate.reservation.repository;

import com.devs.devmate.reservation.entity.Reservation;
import com.devs.devmate.reservation.entity.Reservation.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
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


    @EntityGraph(attributePaths = {"room", "member", "study"})
    @Query(value = """
        select distinct r
        from Reservation r
        left join StudyMember sm
          on sm.study = r.study
         and sm.member.id = :memberId
         and sm.status = com.devs.devmate.study.entity.StudyMember.Status.JOINED
        where r.status = :status
          and (
                r.member.id = :memberId
                or sm.id is not null
          )
    """,
    countQuery = """
        select count(distinct r.id)
        from Reservation r
        left join StudyMember sm
          on sm.study = r.study
         and sm.member.id = :memberId
         and sm.status = com.devs.devmate.study.entity.StudyMember.Status.JOINED
        where r.status = :status
          and (
                r.member.id = :memberId
                or sm.id is not null
          )
    """
    )
    Page<Reservation> findVisibleReservationByMemberIdAndStatus(
            @Param("memberId") Long memberId,
            @Param("status") Status status,
            Pageable pageable);


    // 개인 및 내가 참여한 예약
    @EntityGraph(attributePaths = {"room", "member", "study"})
    @Query(value = """
        select distinct r
        from Reservation r
        left join StudyMember sm
          on sm.study = r.study
         and sm.member.id = :memberId
         and sm.status = com.devs.devmate.study.entity.StudyMember.Status.JOINED
        where r.status = :status
          and r.date = :date
          and (
                r.member.id = :memberId
                or sm.id is not null
          )
    """,
    countQuery = """
        select count(distinct r.id)
        from Reservation r
        left join StudyMember sm
          on sm.study = r.study
         and sm.member.id = :memberId
         and sm.status = com.devs.devmate.study.entity.StudyMember.Status.JOINED
        where r.status = :status
          and r.date = :date
          and (
                r.member.id = :memberId
                or sm.id is not null
          )
    """
    )
    Page<Reservation> findVisibleReservationByMemberIdAndDateAndStatus(
            @Param("memberId") Long memberId,
            @Param("date") LocalDate date,
            @Param("status") Status status,
            Pageable pageable
    );
    // 개인예약만
    List<Reservation> findByMemberIdAndDateAndStatus(
            Long memberId,
            LocalDate date,
            Status status
    );

    @EntityGraph(attributePaths = {"room", "member"})
    Page<Reservation> findByRoomIdAndDateAndStatus(Long roomId, LocalDate date, Status status, Pageable pageable);

    @EntityGraph(attributePaths = {"room", "member"})
    Page<Reservation> findByDateAndStatus(LocalDate date, Status status, Pageable pageable);

    @EntityGraph(attributePaths = {"room", "member", "study"})
    Page<Reservation> findPageByStudyIdAndStatus(Long studyId, Status status, Pageable pageable);

    List<Reservation> findAllByStudyIdAndStatus(Long studyId, Status status);

    List<Reservation> findByRoomIdAndDateAndStatus(Long roomId, LocalDate date, Status status);

    List<Reservation> findByMemberIdAndStatus(Long memberId, Status status);

    long countByMemberIdAndDateAndStatus(Long memberId, LocalDate date, Status status);

    void deleteAllByStudyId(Long studyId);

    @Modifying
    @Query("""
        delete from Reservation r
                where r.status = :status
                        and r.date < :cutoffDate
        """)
    int deleteByStatusAndDateBefore(
            @Param("status") Status status,
            @Param("cutoffDate") LocalDate cutoffDate
        );

    void deleteByStatusAndUpdatedAtBefore(Status status, LocalDateTime cutoff);


}
