package com.devs.devmate.ai.dto;

import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
public class OpenAiRequest {

    private final String model;
    private final String input;

    public OpenAiRequest(String model, String input) {
        this.model = model;
        this.input = input;
    }
}