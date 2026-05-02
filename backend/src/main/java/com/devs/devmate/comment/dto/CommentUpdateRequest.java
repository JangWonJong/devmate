package com.devs.devmate.comment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class CommentUpdateRequest {
    @NotBlank
    private String content;
}
