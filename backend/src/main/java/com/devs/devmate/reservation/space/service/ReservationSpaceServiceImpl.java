package com.devs.devmate.reservation.space.service;

import com.devs.devmate.reservation.space.dto.ReservationSpaceCreateRequest;
import com.devs.devmate.reservation.space.dto.ReservationSpaceResponse;
import com.devs.devmate.reservation.space.entity.ReservationSpace;
import com.devs.devmate.reservation.space.entity.ReservationSpaceProvider;
import com.devs.devmate.reservation.space.entity.ReservationSpaceType;
import com.devs.devmate.reservation.space.repository.ReservationSpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class ReservationSpaceServiceImpl implements ReservationSpaceService{

    private final ReservationSpaceRepository reservationSpaceRepository;

    private ReservationSpaceResponse create(ReservationSpaceCreateRequest req) {
        ReservationSpace saved = reservationSpaceRepository.save(
                ReservationSpace.builder()
                        .name(req.name().trim())
                        .address(req.address())
                        .latitude(req.latitude())
                        .longitude(req.longitude())
                        .externalPlaceId(req.externalPlaceId())
                        .providerType(ReservationSpaceType.USER_INPUT)
                        .providerName(ReservationSpaceProvider.KAKAO)
                        .active(true)
                        .build()
        );

        return ReservationSpaceResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationSpaceResponse> listActive() {
        return reservationSpaceRepository.findByActiveTrue().stream()
                .map(ReservationSpaceResponse::from)
                .toList();
    }

    @Override
    public ReservationSpaceResponse createUserInputSpace(ReservationSpaceCreateRequest request) {

        if (request.externalPlaceId() != null && !request.externalPlaceId().isBlank()) {
                return reservationSpaceRepository.findByExternalPlaceId(request.externalPlaceId())
                        .map(ReservationSpaceResponse::from)
                        .orElseGet(() -> create(request));
            }

            return create(request);
    }
}
