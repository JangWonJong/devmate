package com.devs.devmate.study.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StudyCreateRequest(

        @NotNull
        Long postId,

        @NotNull
        @Min(2)
        Integer maxMembers
) {
}
