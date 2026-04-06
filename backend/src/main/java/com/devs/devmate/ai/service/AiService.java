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

import java.util.Locale;

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
        String trimmedMessage = message == null ? "" : message.trim();
        boolean isShort = trimmedMessage.length() < 10;
        AiTopic topic = detectTopic(trimmedMessage);

        String prompt = buildPrompt(trimmedMessage, isShort, topic);

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

        AiGuideResponse guideResponse = JsonUtils.fromJson(jsonText, AiGuideResponse.class);

        return new AiGuideResponse(
                safeText(guideResponse.getQuestion()),
                limitLines(safeText(guideResponse.getDetails()), 3),
                limitLines(safeText(guideResponse.getHints()), 3)
        );
    }

    private String buildPrompt(String message, boolean isShort, AiTopic topic) {
        String basePrompt = """
                너는 DevMine의 질문 가이드 AI다.

                역할:
                - 사용자의 입력을 개발자 커뮤니티에 올리기 좋은 질문 형태로 정리한다.
                - 정답을 직접 해결해주지 않는다.
                - 대신 더 좋은 질문 제목, 추가로 적으면 좋은 정보, 점검 힌트를 제공한다.
                - 답변은 한국어로 작성한다.

                중요 규칙:
                1. 사용자가 제공하지 않은 정보는 절대 추측하지 마라.
                2. 입력이 짧거나 모호한 경우, 내용을 억지로 구체화하지 말고
                   "추가로 어떤 정보를 적으면 좋은지" 중심으로 작성하라.
                3. 출력은 간결하게 작성하라. 불필요하게 길게 작성하지 마라.
                4. 실제 개발자가 커뮤니티에 올릴 법한 자연스러운 질문 형태로 작성하라.
                5. 템플릿 문구([문제 상황], [환경], [해결 방법] 등)는 사용하지 마라.
                6. details와 hints는 각각 최대 3개까지만 작성한다.
                7. details와 hints는 서로 최대한 중복되지 않게 작성한다.
                8. question은 "해결하고 싶습니다" 같은 서술형보다
                   "~어디를 확인해야 할까요?", "~원인이 무엇일까요?" 같은 실제 질문형을 우선한다.

                반드시 아래 형식의 JSON만 출력해라.
                설명 문장, 코드블록, ```json, ``` 절대 사용하지 마라.

                형식:
                {
                  "question": "자연스러운 한 줄 질문",
                  "details": "- 항목1\\n- 항목2\\n- 항목3",
                  "hints": "- 힌트1\\n- 힌트2\\n- 힌트3"
                }

                작성 규칙:

                - question:
                  - 한 줄 제목 형태로 작성한다.
                  - 커뮤니티 게시글 제목처럼 자연스럽게 작성한다.
                  - 너무 추상적인 표현 대신 상황이 드러나도록 작성한다.
                  - 단, 입력이 짧으면 과하게 구체화하지 말고 자연스럽게 유지한다.
                  - 제목은 너무 길지 않게 작성한다.

                - details:
                  - 게시글 본문에 추가하면 좋은 정보만 작성한다.
                  - 각 항목은 한 줄로 짧고 명확하게 작성한다.
                  - 실제 문제 파악에 필요한 정보 위주로 작성한다.
                  - 입력이 짧으면 일반적인 안내 수준으로 작성한다.

                - hints:
                  - 정답을 직접 주지 말고 점검 방향만 작성한다.
                  - 각 항목은 짧고 명확하게 작성한다.
                  - 실제 점검 포인트 위주로 작성한다.
                  - 입력이 짧으면 일반적인 체크 포인트 위주로 작성한다.
                """;

        String shortInputRule = """
                
                추가 규칙:
                - 사용자의 입력이 매우 짧거나 모호하다.
                - 구체적인 상황을 가정하지 마라.
                - details와 hints는 최소한의 일반적인 안내만 작성하라.
                - question도 과하게 구체적으로 만들지 마라.
                """;

        String topicRule = switch (topic) {
            case SPRING -> """
                    
                    도메인 힌트:
                    - 이 질문은 Spring / Java 백엔드 계열 가능성이 높다.
                    - details에는 Spring Security, JWT 흐름, Controller/Service 구조, 예외 응답, 로그 등
                      실제 원인 파악에 필요한 정보가 있으면 좋다고 안내하라.
                    - hints에는 필터 체인, 인증 객체, 토큰 만료, 시크릿 키, 설정 충돌 같은
                      Spring 백엔드 점검 포인트를 우선하라.
                    """;
            case REACT -> """
                    
                    도메인 힌트:
                    - 이 질문은 React / 프론트엔드 계열 가능성이 높다.
                    - details에는 컴포넌트 구조, 상태 값, props, useEffect/useMemo/useCallback 사용 여부,
                      콘솔 에러, API 응답 상태 등 실제 원인 파악에 필요한 정보를 안내하라.
                    - hints에는 렌더링 흐름, 의존성 배열, 상태 업데이트 타이밍, 이벤트 처리,
                      네트워크 요청 확인 같은 프론트 점검 포인트를 우선하라.
                    """;
            case DATABASE -> """
                    
                    도메인 힌트:
                    - 이 질문은 DB / JPA / SQL 계열 가능성이 높다.
                    - details에는 사용 중인 DB 종류, 테이블 구조, 엔티티 관계, 실행한 쿼리,
                      발생한 에러 메시지 등 실제 원인 파악에 필요한 정보를 안내하라.
                    - hints에는 조인/조건절 확인, 인덱스, 트랜잭션, N+1, 매핑 관계,
                      실행 계획이나 로그 확인 같은 DB 점검 포인트를 우선하라.
                    """;
            case GENERAL -> """
                    
                    도메인 힌트:
                    - 특정 기술 스택이 명확하지 않다면 너무 전문 영역으로 좁혀 추측하지 마라.
                    - details와 hints는 일반적인 개발 문제 파악 흐름 중심으로 작성하라.
                    """;
        };

        return basePrompt
                + (isShort ? shortInputRule : "")
                + topicRule
                + """

                사용자 입력:
                """
                + message;
    }

    private AiTopic detectTopic(String message) {
        String lower = message.toLowerCase(Locale.ROOT);

        if (containsAny(lower,
                "spring", "spring boot", "springboot", "security", "jwt",
                "filter", "interceptor", "jpa", "hibernate", "controller",
                "service", "repository", "java", "access token", "refresh token")) {
            return AiTopic.SPRING;
        }

        if (containsAny(lower,
                "react", "vite", "typescript", "javascript", "jsx", "tsx",
                "useeffect", "usestate", "usememo", "usecallback", "props",
                "state", "router", "axios", "render", "렌더", "프론트")) {
            return AiTopic.REACT;
        }

        if (containsAny(lower,
                "mysql", "postgres", "postgresql", "sql", "query", "쿼리",
                "db", "database", "entity", "join", "index", "transaction",
                "트랜잭션", "n+1", "schema", "테이블")) {
            return AiTopic.DATABASE;
        }

        return AiTopic.GENERAL;
    }

    private boolean containsAny(String target, String... keywords) {
        for (String keyword : keywords) {
            if (target.contains(keyword.toLowerCase(Locale.ROOT))) {
                return true;
            }
        }
        return false;
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

    private String safeText(String value) {
        if (value == null) {
            return "";
        }
        return value.trim();
    }

    private String limitLines(String value, int maxLines) {
        if (value == null || value.isBlank()) {
            return "";
        }

        String[] lines = value.split("\\r?\\n");
        StringBuilder result = new StringBuilder();
        int count = 0;

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) {
                continue;
            }

            if (count == maxLines) {
                break;
            }

            if (result.length() > 0) {
                result.append("\n");
            }

            result.append(trimmed);
            count++;
        }

        return result.toString();
    }

    private enum AiTopic {
        SPRING,
        REACT,
        DATABASE,
        GENERAL
    }
}