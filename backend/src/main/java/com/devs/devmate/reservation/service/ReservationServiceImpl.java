package com.devs.devmate.reservation.service;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.reservation.dto.ReservationCreateRequest;
import com.devs.devmate.reservation.dto.ReservationCreateResponse;
import com.devs.devmate.reservation.dto.ReservationResponse;
import com.devs.devmate.reservation.entity.Reservation;
import com.devs.devmate.reservation.entity.Room;
import com.devs.devmate.reservation.repository.ReservationRepository;
import com.devs.devmate.reservation.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Transactional
public class ReservationServiceImpl implements ReservationService{

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final MemberRepository memberRepository;

    @Override
    public ReservationCreateResponse create(Long memberId, ReservationCreateRequest req) {
        if (!req.startTime().isBefore(req.endTime())) {
            throw new BusinessException(ErrorCode.RESERVATION_TIME_INVALID);
        }

        Room room = roomRepository.findById(req.roomId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        boolean overlap = reservationRepository.existsOverlap(
                room.getId(),
                req.date(),
                req.startTime(),
                req.endTime(),
                Reservation.Status.ACTIVE
        );
        if (overlap) throw new BusinessException(ErrorCode.RESERVATION_OVERLAP);

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
    public void cancel(Long memberId, Long reservationId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));
        if (!r.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_RESERVATION);
        }
        r.cancel();
    }
}
