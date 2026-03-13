package com.devs.devmate.reservation.service;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
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
import java.time.LocalTime;


@Service
@RequiredArgsConstructor
@Transactional
public class ReservationServiceImpl implements ReservationService{

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final MemberRepository memberRepository;
    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;

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
        boolean overlap = reservationRepository.existsOverlap(
                roomId, date, startTime, endTime,
                Reservation.Status.ACTIVE
        );
        if (overlap) {
            throw new BusinessException(ErrorCode.RESERVATION_OVERLAP);
        }
    }

    @Override
    public ReservationCreateResponse create(Long memberId, ReservationCreateRequest req) {

        validateReservationTime(req.startTime(), req.endTime());

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
    @Transactional(readOnly = true)
    public Page<ReservationResponse> listMine(Long memberId, Pageable pageable) {
        return reservationRepository
                .findByMemberIdAndStatus(memberId, Reservation.Status.ACTIVE, pageable)
                .map(ReservationResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservationResponse> listRoomDate(Long roomId, LocalDate date, Pageable pageable) {

        roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        return reservationRepository
                .findByRoomIdAndDateAndStatus(roomId, date, Reservation.Status.ACTIVE, pageable)
                .map(ReservationResponse::from);
    }

    @Override
    @Transactional
    public Page<ReservationResponse> listAllByDate(LocalDate date, Pageable pageable) {
        return reservationRepository
                .findByDateAndStatus(date, Reservation.Status.ACTIVE, pageable)
                .map(ReservationResponse::from);
    }

    @Override
    public void cancel(Long memberId, Long reservationId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));
        if (!r.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_RESERVATION);
        }
        r.cancel();
    }

    @Override
    public ReservationCreateResponse createForStudy(Long memberId, Long studyId, StudyReservationCreateRequest req) {

        validateReservationTime(req.startTime(), req.endTime());

        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        if (studyMemberRepository.findByStudyIdAndMemberIdAndStatus(
                studyId, memberId, StudyMember.Status.JOINED
        ).isEmpty()) {
            throw new BusinessException(ErrorCode.FORBIDDEN_STUDY_RESERVATION);
        }

        Room room = findRoom(req.roomId());

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        validateReservationOverlap(
                room.getId(), req.date(), req.startTime(), req.endTime());

        String title = "[스터디]" + study.getPost().getTitle();

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

        return new ReservationCreateResponse(saved.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservationResponse> listByStudy(Long studyId, Pageable pageable) {
       studyRepository.findById(studyId)
               .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        return reservationRepository
                .findByStudyIdAndStatus(studyId, Reservation.Status.ACTIVE, pageable)
                .map(ReservationResponse::from);
    }
}
