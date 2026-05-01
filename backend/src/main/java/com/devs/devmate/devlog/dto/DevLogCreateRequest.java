package com.devs.devmate.devlog.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class DevLogCreateRequest {

    @NotBlank
    @Size(max = 150)
    private String title;

    @NotBlank
    private String problem;

    @NotBlank
    private String solution;

    private String reference;

    private String retrospective;
}
