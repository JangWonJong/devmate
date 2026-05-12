package com.devs.devmate.study.dto;

public record StudyPlaceUpdateRequest(
        String placeName,
        String address,
        Double latitude,
        Double longitude,
        String externalPlaceId
) {
}
