package com.devs.devmate.post.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class PostUpdateRequest {

    @NotBlank
    @Size(max = 150)
    private String title;

    @NotBlank
    private String content;
}
