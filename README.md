# 🚀 DevMine

> 개발 고민을 공유하고
> 댓글 채택을 통해 문제를 해결하며
> 스터디 참여와 협업까지 이어지는
> **실제 서비스형 개발 커뮤니티 플랫폼**

---

# 🌐 배포 주소

👉 https://devmine.kr

프론트: Vercel
백엔드: AWS EC2 + Nginx
HTTPS 적용 (Let's Encrypt)

---

# 🧠 프로젝트 소개

DevMine은 개발자들이 단순히 질문을 올리는 것을 넘어
**문제해결 -> 학습 -> 협업(스터디)** 까지 이어질 수 있도록 설계된 플랫폼입니다.

특히 **AI 기반 질문 가이드 기능**을 통해
사용자가 더 좋은 질문을 작성하도록 도와주고,
커뮤니티에서 더 빠르고 정확한 답변을 얻을 수 있도록 설계했습니다.

단순 CRUD 프로젝트가 아니라
- **실제 배포 가능한 서비스 구조**
- **JWT 기반 인증 설계**
- **도메인 중심 백엔드 아키텍처**
  
를 목표로 개발되었습니다.

### 🔥 핵심 흐름

```
개발 고민 등록
 → 댓글을 통한 해결
 → 채택 기능으로 해결 확정
 → 스터디 모집/참여
 → 스터디룸 예약
 → 실제 협업 연결
```

👉 단순 Q&A가 아니라
“문제 해결 → 협업 연결”까지 이어지는 구조가 핵심입니다.

---

### 🤖 AI 질문 가이드

DevMine의 AI는 정답을 알려주는 챗봇이 아니라,
좋은 질문을 만들도록 돕는 보조 도구입니다.

질문을 분석하여 더 명확한 형태로 정리
추가로 필요한 정보 제안
문제 상황 점검 힌트 제공
개선된 질문을 게시글 작성 화면에 자동 반영

👉 커뮤니티 품질을 높이는 방향으로 설계

---

# ✨ 주요 기능

---

## 🔐 인증 구조

DevMine은 **JWT 기반 인증 시스템**을 사용합니다.

**인증 전략**
- Access Token (15분)
- Refresh Token (7일)

**설계 포인트**
- Stateless 인증 구조
- Refresh Token DB 저장 + 해싱 처리
- 토큰 재발급 흐름 구현
- 로그아웃 시 Refresh Token 무효화
  
📌 탈퇴정책
* 스터디 리더인 경우 탈퇴 불가

👉 보안성과 사용자 경험을 동시에 고려한 인증 구조 설계
DevMine은 **JWT 기반 인증 시스템**을 사용합니다.

---

## 💬 커뮤니티 

* 게시글 / 댓글 CRUD
* 댓글 채택 기능
* 고민 해결 여부 처리
* 게시글 타입 분리
  * QUESTION : 개발 고민 게시글
  * STUDY : 스터디 모집 게시글

---

## ❤️ 좋아요 & 인기 기능

* 게시글 좋아요 / 댓글 좋아요
* 프로필 좋아요
* 인기 게시글 정렬 (좋아요 기준)
* 좋아요 기반 인기 멤버 시스템
* 좋아요 게시글 조회

---

## 👤 프로필 시스템

* 공개 프로필 페이지
* 프로필 이미지 업로드
* 인기 점수 기반 랭킹

---

## 👥 스터디

* 스터디 생성 / 참가 / 탈퇴
* 스터디 리더 관리
* 모집 상태 관리
* 스터디별 예약 가능한 룸 확

---

## 📅 예약 시스템

* 개인 + 스터디 예약 통합 관리
* 시간 충돌 방지
* 예약 취소

📌 예약 정책
* 1회 최소 1시간 / 최대 3시간
* 하루 최대 5시간
* 과거 시간 예약 불가

---

## 🔔 알림 시스템

* 댓글 / 채택 / 스터디 관련 알림
* 링크기능
* 알림 자동 만

---

## 📩 문의 기능
* 문의 등록 / 조회
* UI 내 질문 가이드 패널 연동

---

# 🧱 기술 스택
**Backend**
* Spring Boot
* Spring Security + JWT
* JPA (Hibernate)
* MySQL

**Frontend**
* React (Vite + TypeScript)
* React Router
* Axios
* Tailwind CSS

**Infra**
* AWS EC2
* Nginx
* Vercel (Frontend)

---


# 🏗 아키텍처 설계 방향

**Backend**
* Domain 기반 패키지 구조
* Service / ServiceImpl 분리
* DTO + ApiResponse 공통 응답 구조
* BaseEntity 기반 공통 필드 관리

**Frontend**
* router.tsx 중심 라우팅 구조
* Layout 기반 페이지 구성
* hooks 기반 상태 관리
* 토큰 store + 이벤트 기반 인증 상태 관리

DevMine는 **도메인 중심 구조(Domain Driven Structure)** 기반으로 설계되었습니다.

👉 향후 MSA 전환을 고려한 **Monolithic 구조**로 설계되었습니다


## 📌 서비스 아키텍처

React (Vite + TypeScript)  
          ↓  
Vercel (Frontend Hosting)  
          ↓  
HTTPS (api.devmine.kr)  
          ↓  
Spring Boot (AWS EC2 + Nginx)  
          ↓   
MySQL
---

# 📂 Project Structure

```
src/main/java/com/devs/devmate

├── global        # 공통 설정, JWT, Security, Exception
├── auth          # 로그인 / 토큰 발급
├── member        # 회원 관리
├── post          # 고민, 스터디 게시글
├── comment       # 댓글 기능
├── reservation   # 스터디룸 예약
├── study         # 스터디 모집 / 참여 / 운영
├── notification  # 알림

└── DevmateApplication.java
```

```
post
 ├── controller
 ├── service
 │   ├── PostService
 │   └── PostServiceImpl
 ├── repository
 ├── entity
 └── dto
```

---

# 🗄 주요 도메인

## Member

| 컬럼       | 설명               |
| -------- | ---------------- |
| id       | PK               |
| email    | 로그인 ID           |
| password | BCrypt 암호화       |
| nickname | 닉네임              |
| bio      | 한 줄 소개           |
| status   | ACTIVE / DELETED |
| role     | USER / ADMIN     |

👉 탈퇴 시:

* 상태를 DELETED로 변경
* 기존 작성 데이터는 유지 (작성자 표시)

---

## ⚡ 기술적 포인트

* JWT Access/Refresh 구조 + 자동 재발급
* URL 상태 동기화를 통한 UX 개선
* 예약 정책 설계 (시간 겹침 / 제한 조건)
* 이벤트 기반 로그인 상태 관리 (polling 제거)
* 좋아요 기반 인기 시스템 설계
* 실제 배포 경험 (EC2 + Nginx + 도메인)

---

## 🚀 배포
* Backend: AWS EC2 + Nginx
* Frontend: Vercel
* 도메인 연결 완료

---

# 📡 API Example

```
POST /api/posts
```

```json
{
  "title": "Spring Security JWT 질문",
  "content": "JWT 구조가 궁금합니다."
}
```

```json
{
  "success": true,
  "data": {
    "id": 1
  }
}
```

---

# 🚀 실행 방법

```bash
git clone https://github.com/JangWonJong/devmate.git
cd devmate
./gradlew bootRun
```

---

# 📌 향후 개선 계획

* 예약 동시성 처리 강화 (Race Condition 방지)
* 실시간 알림 (SSE 또는 WebSocket)
* AI 질문 가이드 고도화
* 문의 기능 확장 (관리 기능 포함)
* 파일 업로드/URL 경로 안정화
* 프로필 공개 범위 설정

---

# 🎯 프로젝트 목표

**DevMine**은 단순 CRUD를 넘어

- 실제 서비스 배포 경험
- 인증 시스템 설계 경험
- 도메인 기반 아키텍처 설계 경험

을 목표로 개발되었습니다.
