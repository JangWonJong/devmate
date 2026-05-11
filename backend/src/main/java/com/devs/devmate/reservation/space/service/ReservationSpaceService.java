package com.devs.devmate.reservation.space.service;

import com.devs.devmate.reservation.space.dto.ReservationSpaceCreateRequest;
import com.devs.devmate.reservation.space.dto.ReservationSpaceResponse;

import java.util.List;

public interface ReservationSpaceService {

    List<ReservationSpaceResponse> listActive();

    ReservationSpaceResponse createUserInputSpace(ReservationSpaceCreateRequest request);

}
