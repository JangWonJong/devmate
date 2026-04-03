package com.devs.devmate.ai.service;

import com.devs.devmate.ai.dto.AiGuideResponse;
import com.devs.devmate.ai.dto.OpenAiRequest;
import com.devs.devmate.ai.dto.OpenAiResponse;
import com.devs.devmate.global.common.JsonUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class AiService {

    private final WebClient.Builder webClientBuilder;

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    @Value("${openai.url}")
    private String url;

    public AiGuideResponse guideQuestion(String message) {
        String instructions = """
                너는 개발자 커뮤니티 DevMine의 질문 가이드 AI다.

                역할:
                - 사용자의 질문을 더 명확한 질문으로 정리한다.
                - 해결 방법을 직접 완성해서 제공하지 않는다.
                - 대신 점검 방향과 힌트를 제공한다.
                - 커뮤니티에 질문하도록 유도한다.

                반드시 아래 형식의 JSON만 출력해라.
                {
                  "question": "추천 질문 제목",
                  "details": "추가로 작성하면 좋은 정보",
                  "hints": "점검 힌트"
                }

                question:
                - 한 줄 제목 형태
                - 커뮤니티 게시글 제목처럼 자연스럽게 작성

                details:
                - 게시글 본문에 추가하면 좋은 정보들을 줄바꿈 텍스트로 작성

                hints:
                - 정답 대신 점검 방향만 제공
                - 최대 3~4줄
                - 불필요한 마무리 문장은 넣지 말 것
                """;

        OpenAiRequest request = new OpenAiRequest(model, instructions, message);

        OpenAiResponse response = webClientBuilder.build()
                .post()
                .uri(url)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(OpenAiResponse.class)
                .block();

        String jsonText = extractText(response);
        return JsonUtils.fromJson(jsonText, AiGuideResponse.class);
    }

    private String extractText(OpenAiResponse response) {
        if (response == null || response.getOutput() == null || response.getOutput().isEmpty()) {
            throw new IllegalStateException("OpenAI 응답이 비어 있습니다.");
        }

        for (OpenAiResponse.OutputItem outputItem : response.getOutput()) {
            if (outputItem.getContent() == null) continue;

            for (OpenAiResponse.ContentItem contentItem : outputItem.getContent()) {
                if ("output_text".equals(contentItem.getType()) && contentItem.getText() != null) {
                    return contentItem.getText();
                }
            }
        }

        throw new IllegalStateException("OpenAI 텍스트 응답을 찾을 수 없습니다.");
    }
}