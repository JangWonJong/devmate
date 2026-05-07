import type { DevLogResponse } from "../../api/devlog/devlog"

export function buildPostDraftFromDevLog(devLog: DevLogResponse) {
  const title = `[DevLog 질문] ${devLog.title}`

  const content = [
    "DevLog를 작성하면서 아래 내용에 대해 다른 개발자들의 의견을 듣고 싶어 글을 남깁니다.",
    "",
    "## 문제 상황",
    devLog.problem?.trim() || "작성된 문제 상황이 없습니다.",
    "",
    "## 시도한 해결 과정",
    devLog.solution?.trim() || "작성된 해결 과정이 없습니다.",
    "",
    devLog.reference?.trim()
      ? `## 참고한 코드 / 개념\n${devLog.reference.trim()}\n`
      : "",
    devLog.retrospective?.trim()
      ? `## 현재 고민 / 회고\n${devLog.retrospective.trim()}\n`
      : "",
    "## 질문하고 싶은 점",
    "- 이 방식으로 해결하는 것이 적절한지 궁금합니다.",
    "- 더 나은 구조나 개선 방향이 있다면 조언 부탁드립니다.",
  ]
    .filter(Boolean)
    .join("\n")

  return {
    title,
    content,
  }
}