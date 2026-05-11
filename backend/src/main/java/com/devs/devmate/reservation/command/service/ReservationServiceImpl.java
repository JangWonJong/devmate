package com.devs.devmate.reservation.command.service;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.MemberStatus;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.notification.service.NotificationService;
import com.devs.devmate.reservation.availability.AvailabilityEvaluationResult;
import com.devs.devmate.reservation.availability.ReservationAvailabilityEvaluator;
import com.devs.devmate.reservation.availability.dto.AvailabilityResponse;
import com.devs.devmate.reservation.availability.dto.AvailabilitySlotResponse;
import com.devs.devmate.reservation.command.dto.ReservationCreateRequest;
import com.devs.devmate.reservation.command.dto.ReservationCreateResponse;
import com.devs.devmate.reservation.command.dto.ReservationResponse;
import com.devs.devmate.reservation.command.dto.StudyReservationCreateRequest;
import com.devs.devmate.reservation.command.entity.Reservation;
import com.devs.devmate.reservation.space.entity.ReservationSpace;
import com.devs.devmate.reservation.command.repository.ReservationLockRepository;
import com.devs.devmate.reservation.command.repository.ReservationRepository;
import com.devs.devmate.reservation.space.repository.ReservationSpaceRepository;
import com.devs.devmate.reservation.sse.ReservationSseService;
import com.devs.devmate.study.entity.Study;
import com.devs.devmate.study.entity.StudyMember;
import com.devs.devmate.study.repository.StudyMemberRepository;
import com.devs.devmate.study.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;


@Service
@RequiredArgsConstructor
@Transactional
public class ReservationServiceImpl implements ReservationService{

    private final ReservationRepository reservationRepository;
    private final ReservationSpaceRepository reservationSpaceRepository;
    private final MemberRepository memberRepository;
    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final NotificationService notificationService;
    private final ReservationAvailabilityEvaluator reservationAvailabilityEvaluator;
    private final ReservationLockRepository lockRepository;
    private final ReservationSseService reservationSseService;

    private ReservationSpace findReservationSpace(Long reservationSpaceId) {
        return reservationSpaceRepository.findById(reservationSpaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_SPACE_NOT_FOUND));
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

    private void validateReservationOverlap(Long reservationSpaceId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        boolean overlap = reservationRepository.existsReservationSpaceOverlap(
                reservationSpaceId, date, startTime, endTime,
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

    private <T> T executeWithLock(String key, Supplier<T> action) {

        boolean locked = lockRepository.tryLock(key, 3);

        if (!locked) {
            throw new BusinessException(ErrorCode.RESERVATION_CONFLICT);
        }
        try {
            return action.get();
        } finally {
            lockRepository.releaseLock(key);
        }
    }

    private String createLockKey(Long reservationSpaceId, LocalDate date) {
        return "reservation:space:" + reservationSpaceId + ":date:" + date;
    }

    private record TimeSlot(LocalTime startTime, LocalTime endTime){}

    private List<TimeSlot> createBaseSlots() {
        List<TimeSlot> slots = new ArrayList<>();

        LocalTime start = LocalTime.of(9, 0);
        LocalTime end = LocalTime.of(22, 0);

        while (start.isBefore(end)) {
            LocalTime next = start.plusHours(1);
            slots.add(new TimeSlot(start, next));
            start = next;
        }

        return slots;
    }

    private void sendReservationUpdateAfterCommit(Long reservationSpaceId, LocalDate date) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    reservationSseService.send(reservationSpaceId, date);
                }
            });
            return;

        }
        reservationSseService.send(reservationSpaceId, date);
    }

    @Override
    public ReservationCreateResponse create(Long memberId, ReservationCreateRequest req) {

        validateReservationTime(req.startTime(), req.endTime());
        validateNotPastReservation(req.date(), req.startTime());
        validateDailyCreationLimit(memberId, req.date(), req.startTime(), req.endTime());
        validateMemberOverlap(memberId, req.date(), req.startTime(), req.endTime());
        ReservationSpace reservationSpace = findReservationSpace(req.reservationSpaceId());

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (member.getStatus() == MemberStatus.SUSPENDED) {
            throw new BusinessException(ErrorCode.SUSPENDED_MEMBER);
        }

        if (member.getStatus() == MemberStatus.DELETED) {
            throw new BusinessException(ErrorCode.DELETED_MEMBER);
        }

        String lockKey = createLockKey(req.reservationSpaceId(), req.date());

        return executeWithLock(lockKey, () -> {
            validateReservationOverlap(
                    reservationSpace.getId(), req.date(), req.startTime(), req.endTime());

            Reservation saved = reservationRepository.save(
                    Reservation.builder()
                            .member(member)
                            .reservationSpace(reservationSpace)
                            .date(req.date())
                            .startTime(req.startTime())
                            .endTime(req.endTime())
                            .title(req.title().trim())
                            .placeDetail(req.placeDetail() == null ? null : req.placeDetail().trim())
                            .status(Reservation.Status.ACTIVE)
                            .build()
            );

            sendReservationUpdateAfterCommit(req.reservationSpaceId(), req.date());

            return new ReservationCreateResponse(saved.getId());
        });
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

        ReservationSpace reservationSpace = findReservationSpace(req.reservationSpaceId());

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (member.getStatus() == MemberStatus.DELETED) {
            throw new BusinessException(ErrorCode.DELETED_MEMBER);
        }

        String lockKey = createLockKey(req.reservationSpaceId(), req.date());
        String title = "[스터디] " + study.getPost().getTitle();

        return executeWithLock(lockKey, () -> {
            validateReservationOverlap(
                    reservationSpace.getId(),
                    req.date(),
                    req.startTime(),
                    req.endTime()
            );

            Reservation saved = reservationRepository.save(
                    Reservation.builder()
                            .member(member)
                            .reservationSpace(reservationSpace)
                            .study(study)
                            .date(req.date())
                            .startTime(req.startTime())
                            .endTime(req.endTime())
                            .title(title)
                            .placeDetail(req.placeDetail() == null ? null : req.placeDetail().trim())
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

            sendReservationUpdateAfterCommit(req.reservationSpaceId(), req.date());

            return new ReservationCreateResponse(saved.getId());
        });
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
    public Page<ReservationResponse> listReservationSpaceReservations(Long reservationSpaceId, LocalDate date, Pageable pageable) {

        reservationSpaceRepository.findById(reservationSpaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_SPACE_NOT_FOUND));

        return reservationRepository
                .findByReservationSpaceIdAndDateAndStatus(reservationSpaceId, date, Reservation.Status.ACTIVE, pageable)
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

        sendReservationUpdateAfterCommit(reservation.getReservationSpace().getId(), reservation.getDate());
    }

    @Override
    public AvailabilityResponse getAvailability(Long reservationSpaceId, Long memberId, LocalDate date) {
        ReservationSpace reservationSpace = reservationSpaceRepository.findById(reservationSpaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_SPACE_NOT_FOUND));

        List<Reservation> spaceReservations = reservationRepository.findByReservationSpaceIdAndDateAndStatus(
                reservationSpace.getId(),
                date,
                Reservation.Status.ACTIVE
        );

        List<Reservation> myReservations = reservationRepository.findByMemberIdAndDateAndStatus(
                memberId,
                date,
                Reservation.Status.ACTIVE
        );

        List<AvailabilitySlotResponse> slots = createBaseSlots().stream()
                .map(slot -> {
                    AvailabilityEvaluationResult result = reservationAvailabilityEvaluator.evaluate(
                            date,
                            slot.startTime(),
                            slot.endTime(),
                            spaceReservations,
                            myReservations
                    );

                    return new AvailabilitySlotResponse(
                            slot.startTime(),
                            slot.endTime(),
                            result.available(),
                            result.reason()
                    );
                })
                .toList();

        return new AvailabilityResponse(reservationSpace.getId(), date, slots);
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
