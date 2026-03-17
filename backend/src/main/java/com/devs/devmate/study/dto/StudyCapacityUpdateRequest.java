package com.devs.devmate.study.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StudyCapacityUpdateRequest(
        @NotNull
        @Min(2)
        Integer maxMembers
) {
}
