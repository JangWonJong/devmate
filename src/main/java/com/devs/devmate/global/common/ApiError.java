package com.devs.devmate.global.common;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApiError {

    private final String code;
    private final String message;
}
