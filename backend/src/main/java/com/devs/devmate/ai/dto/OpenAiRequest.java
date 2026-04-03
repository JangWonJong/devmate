package com.devs.devmate.ai.dto;

import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
public class OpenAiRequest {

    private final String model;
    private final String instructions;
    private final String input;
    private final Map<String, Object> text;

    public OpenAiRequest(String model, String instructions, String input) {
        this.model = model;
        this.instructions = instructions;
        this.input = input;
        this.text = Map.of(
                "format", Map.of(
                        "type", "json_object"
                )
        );
    }
}
