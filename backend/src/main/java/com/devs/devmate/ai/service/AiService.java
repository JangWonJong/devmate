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
        String prompt = """
            너는 DevMine의 질문 가이드 AI다.
            
            역할:
            - 사용자의 입력을 개발자 커뮤니티에 올리기 좋은 질문 형태로 정리한다.
            - 정답을 직접 해결해주지 않는다.
            - 대신 더 좋은 질문 제목, 추가로 적으면 좋은 정보, 점검 힌트를 제공한다.
            - 답변은 한국어로 작성한다.
            
            반드시 아래 형식의 JSON만 출력해라.
            설명 문장, 코드블록, ```json, ``` 절대 사용하지 마라.
            
            형식:
            {
              "question": "커뮤니티 글 제목처럼 자연스러운 한 줄 질문",
              "details": "- 추가 정보 1\\n- 추가 정보 2\\n- 추가 정보 3",
              "hints": "- 점검 힌트 1\\n- 점검 힌트 2\\n- 점검 힌트 3"
            }
            
            작성 규칙:
            - question:
              - 한 줄 제목 형태로 작성한다.
              - 커뮤니티 게시글 제목처럼 자연스럽고 구체적으로 작성한다.
              - 사용자의 의도를 유지하되, 어색한 표현이나 오탈자는 자연스럽게 보정한다.
              - 기술명, 프레임워크명, 모델명은 일반적으로 많이 쓰는 표기로 정리한다.
              - "문제 어떻게 해결하나요?", "어떻게 해야 하나요?" 같은 너무 포괄적인 표현은 가능하면 피한다.
              - 문제의 원인, 증상, 상황이 드러나는 제목을 우선한다.
              - 제목은 너무 길지 않게 작성한다.
            
            - details:
              - 게시글 본문에 추가하면 좋은 정보만 정리한다.
              - 최대 3개까지만 작성한다.
              - 각 항목은 한 줄로 짧고 명확하게 작성한다.
              - 너무 일반적인 항목보다 현재 문제를 파악하는 데 직접 필요한 정보 위주로 작성한다.
            
            - hints:
              - 정답을 직접 주지 말고 점검 방향만 작성한다.
              - 최대 3개까지만 작성한다.
              - 각 항목은 짧고 명확하게 작성한다.
              - 너무 추상적인 표현보다 실제 점검 포인트 위주로 작성한다.
            
            주의사항:
            - JSON 외의 다른 텍스트는 절대 출력하지 마라.
            - 값이 비어 있지 않게 작성한다.
            - 사용자가 너무 짧게 입력해도 가능한 범위에서 자연스럽게 보완한다.
            - details와 hints는 서로 중복되지 않게 작성한다.
            
            사용자 입력:
            """ + message;

        OpenAiRequest request = new OpenAiRequest(model, prompt);

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
        jsonText = cleanJson(jsonText);

        return JsonUtils.fromJson(jsonText, AiGuideResponse.class);
    }

    private String extractText(OpenAiResponse response) {
        if (response == null || response.getOutput() == null || response.getOutput().isEmpty()) {
            throw new IllegalStateException("OpenAI 응답이 비어 있습니다.");
        }

        for (OpenAiResponse.OutputItem outputItem : response.getOutput()) {
            if (outputItem.getContent() == null) {
                continue;
            }

            for (OpenAiResponse.ContentItem contentItem : outputItem.getContent()) {
                if ("output_text".equals(contentItem.getType()) && contentItem.getText() != null) {
                    return contentItem.getText();
                }
            }
        }

        throw new IllegalStateException("OpenAI 텍스트 응답을 찾을 수 없습니다.");
    }

    private String cleanJson(String text) {
        if (text == null) {
            return null;
        }

        return text
                .replace("```json", "")
                .replace("```", "")
                .trim();
    }
}