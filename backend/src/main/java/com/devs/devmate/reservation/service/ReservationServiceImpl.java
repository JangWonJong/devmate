package com.devs.devmate.reservation.service;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.notification.service.NotificationService;
import com.devs.devmate.reservation.dto.ReservationCreateRequest;
import com.devs.devmate.reservation.dto.ReservationCreateResponse;
import com.devs.devmate.reservation.dto.ReservationResponse;
import com.devs.devmate.reservation.dto.StudyReservationCreateRequest;
import com.devs.devmate.reservation.entity.Reservation;
import com.devs.devmate.reservation.entity.Room;
import com.devs.devmate.reservation.repository.ReservationRepository;
import com.devs.devmate.reservation.repository.RoomRepository;
import com.devs.devmate.study.entity.Study;
import com.devs.devmate.study.entity.StudyMember;
import com.devs.devmate.study.repository.StudyMemberRepository;
import com.devs.devmate.study.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class ReservationServiceImpl implements ReservationService{

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final MemberRepository memberRepository;
    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final NotificationService notificationService;

    private Room findRoom(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));
    }

    private void validateReservationTime(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null) {
            throw new BusinessException(ErrorCode.RESERVATION_TIME_INVALID);
        }

        if (!startTime.isBefore(endTime)) {
            throw new BusinessException(ErrorCode.RESERVATION_TIME_INVALID);
        }

        long minutes = Duration.between(startTime, endTime).toMinutes();
        if (minutes < 60 || minutes > 180) {
            throw new BusinessException(ErrorCode.INVALID_RESERVATION_DURATION);
        }
    }

    private void validateReservationOverlap(Long roomId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        boolean overlap = reservationRepository.existsRoomOverlap(
                roomId, date, startTime, endTime,
                Reservation.Status.ACTIVE
        );
        if (overlap) {
            throw new BusinessException(ErrorCode.RESERVATION_OVERLAP);
        }
    }

    private void validateMemberOverlap(Long memberId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        boolean overlap = reservationRepository.existsMemberOverlap(
                memberId, date, startTime, endTime,
                Reservation.Status.ACTIVE
        );
        if (overlap) {
            throw new BusinessException(ErrorCode.MEMBER_RESERVATION_TIME_CONFLICT);
        }
    }

    private void validateNotPastReservation(LocalDate date, LocalTime startTime) {
        if (date == null || startTime == null) {
            throw new BusinessException(ErrorCode.RESERVATION_TIME_INVALID);
        }

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        if (date.isBefore(today)) {
            throw new BusinessException(ErrorCode.PAST_RESERVATION_NOT_ALLOWED);
        }
        if (date.isEqual(today) && !startTime.isAfter(now)) {
            throw new BusinessException(ErrorCode.PAST_RESERVATION_NOT_ALLOWED);
        }
    }

    private void validateCancelable(Reservation reservation) {
        LocalDateTime reservationStart = LocalDateTime.of(
                reservation.getDate(), reservation.getStartTime()
        );

        LocalDateTime cancelDeadline = reservationStart.minusHours(1);
        LocalDateTime now = LocalDateTime.now();

        if (now.isAfter(cancelDeadline)) {
            throw new BusinessException(ErrorCode.RESERVATION_CANCEL_NOT_ALLOWED);
        }
    }

    private void validateDailyCreationLimit(Long memberId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<Reservation> reservations = reservationRepository.findByMemberIdAndDateAndStatus(
                memberId, date, Reservation.Status.ACTIVE
        );

        if (reservations.size() >= 3) {
            throw new BusinessException(ErrorCode.RESERVATION_DAILY_LIMIT_EXCEEDED);
        }

        long reservedMinutes = reservations.stream()
                .mapToLong(r -> Duration.between(r.getStartTime(), r.getEndTime()).toMinutes())
                .sum();

        long newReservationMinutes = Duration.between(startTime, endTime).toMinutes();

        if (reservedMinutes + newReservationMinutes > 300) {
            throw new BusinessException(ErrorCode.RESERVATION_DAILY_HOURS_EXCEEDED);
        }
    }

    private void validateStudyMembersReservationConflict(
            Long studyId, Long requestId,
            LocalDate date, LocalTime startTime, LocalTime endTime
    ) {
        List<StudyMember> studyMembers = studyMemberRepository.findByStudyIdAndStatus(
                studyId, StudyMember.Status.JOINED
        );

        for (StudyMember studyMember : studyMembers) {
            Long studyMemberId = studyMember.getMember().getId();

            if (studyMemberId.equals(requestId)) {
                continue;
            }

            boolean overlap = reservationRepository.existsMemberOverlap(
                    studyMemberId, date, startTime, endTime, Reservation.Status.ACTIVE
            );

            if (overlap) {
                throw new BusinessException(ErrorCode.STUDY_RESERVATION_MEMBER_CONFLICT);
            }
        }
    }

    @Override
    public ReservationCreateResponse create(Long memberId, ReservationCreateRequest req) {

        validateReservationTime(req.startTime(), req.endTime());
        validateNotPastReservation(req.date(), req.startTime());
        validateDailyCreationLimit(memberId, req.date(), req.startTime(), req.endTime());
        validateMemberOverlap(memberId, req.date(), req.startTime(), req.endTime());
        Room room = findRoom(req.roomId());

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        validateReservationOverlap(
                room.getId(), req.date(), req.startTime(), req.endTime());

        Reservation saved = reservationRepository.save(
                Reservation.builder()
                        .member(member)
                        .room(room)
                        .date(req.date())
                        .startTime(req.startTime())
                        .endTime(req.endTime())
                        .title(req.title().trim())
                        .status(Reservation.Status.ACTIVE)
                        .build()
        );

        return new ReservationCreateResponse(saved.getId());
    }

    @Override
    public ReservationCreateResponse createForStudy(Long memberId, Long studyId, StudyReservationCreateRequest req) {

        validateReservationTime(req.startTime(), req.endTime());
        validateNotPastReservation(req.date(), req.startTime());
        validateDailyCreationLimit(memberId, req.date(), req.startTime(), req.endTime());
        validateMemberOverlap(memberId, req.date(), req.startTime(), req.endTime());

        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        if (studyMemberRepository.findByStudyIdAndMemberIdAndStatus(
                studyId, memberId, StudyMember.Status.JOINED
        ).isEmpty()) {
            throw new BusinessException(ErrorCode.FORBIDDEN_STUDY_RESERVATION);
        }

        validateStudyMembersReservationConflict(
                studyId, memberId, req.date(), req.startTime(), req.endTime()
        );

        Room room = findRoom(req.roomId());

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        validateReservationOverlap(
                room.getId(), req.date(), req.startTime(), req.endTime());

        String title = "[스터디] " + study.getPost().getTitle();

        Reservation saved = reservationRepository.save(
                Reservation.builder()
                        .member(member)
                        .room(room)
                        .study(study)
                        .date(req.date())
                        .startTime(req.startTime())
                        .endTime(req.endTime())
                        .title(title)
                        .status(Reservation.Status.ACTIVE)
                        .build()
        );

        List<StudyMember> joinedMembers = studyMemberRepository.findByStudyIdAndStatus(
                studyId, StudyMember.Status.JOINED
        );

        for (StudyMember studyMember : joinedMembers) {
            notificationService.createStudyReservationCreated(
                    studyMember.getMember(),
                    member,
                    study.getPost().getId(),
                    study.getPost().getTitle()
            );
        }

        return new ReservationCreateResponse(saved.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservationResponse> listMyReservations(Long memberId, Pageable pageable) {
        return reservationRepository
                .findVisibleReservationByMemberIdAndStatus(memberId, Reservation.Status.ACTIVE, pageable)
                .map(ReservationResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservationResponse> listMyReservationsByDate(Long memberId, LocalDate date, Pageable pageable) {
        return reservationRepository
                .findVisibleReservationByMemberIdAndDateAndStatus(memberId, date, Reservation.Status.ACTIVE, pageable)
                .map(ReservationResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservationResponse> listRoomReservations(Long roomId, LocalDate date, Pageable pageable) {

        roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        return reservationRepository
                .findByRoomIdAndDateAndStatus(roomId, date, Reservation.Status.ACTIVE, pageable)
                .map(ReservationResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservationResponse> listReservationsByDate(LocalDate date, Pageable pageable) {
        return reservationRepository
                .findByDateAndStatus(date, Reservation.Status.ACTIVE, pageable)
                .map(ReservationResponse::from);
    }

    @Override
    public void cancel(Long memberId, Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));

        if (!reservation.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_RESERVATION);
        }

        validateCancelable(reservation);

        reservation.cancel();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservationResponse> listStudyReservations(Long studyId, Pageable pageable) {
       studyRepository.findById(studyId)
               .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        return reservationRepository
                .findPageByStudyIdAndStatus(studyId, Reservation.Status.ACTIVE, pageable)
                .map(ReservationResponse::from);
    }
}
