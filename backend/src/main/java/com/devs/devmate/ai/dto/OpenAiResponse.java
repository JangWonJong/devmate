package com.devs.devmate.ai.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class OpenAiResponse {

    private List<OutputItem> output;

    @Getter
    @NoArgsConstructor
    public static class OutputItem {
        private List<ContentItem> content;
    }

    @Getter
    @NoArgsConstructor
    public static class ContentItem {
        private String type;
        private String text;
    }
}
