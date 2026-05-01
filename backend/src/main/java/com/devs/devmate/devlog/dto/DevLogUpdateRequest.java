package com.devs.devmate.devlog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.util.List;

@Getter
public class DevLogUpdateRequest {

    @NotBlank
    @Size(max = 150)
    private String title;

    @NotBlank
    private String problem;

    @NotBlank
    private String solution;

    private String reference;

    private String retrospective;

    private List<Long> removedFileIds;
}
