package com.devs.devmate.study.dto;

import jakarta.validation.constraints.NotNull;

public record StudyLeaderDelegateRequest(
        @NotNull
        Long targetMemberId
) {
}
