# 🚀 DevMate

> 개발 고민을 공유하고
> 댓글 채택을 통해 문제를 해결하며
> 스터디 참여와 협업까지 이어지는
> **개발 문제 해결 기반 커뮤니티 플랫폼**

---

# 🧠 프로젝트 소개

DevMate는 개발자들이 단순히 질문을 올리는 것을 넘어
**문제해결 -> 학습 -> 협업(스터디)** 까지 이어질 수 있도록 설계된 플랫폼입니다.

단순 CRUD 프로젝트가 아니라
Spring Boot 기반 **실무 아키텍처 설계 + 서비스 구조 설계 경험**을 목표로 개발되었습니다.

### 🔥 핵심 흐름

```
개발 고민 → 댓글 해결 → 채택 → 스터디 연결 → 예약 → 실제 학습
```

---

# ⚙ 기술 스택

| 구분          | 기술                    |
| ----------- | --------------------- |
| Backend     | Spring Boot           |
| Language    | Java 17               |
| ORM         | Spring Data JPA       |
| Security    | Spring Security + JWT |
| Database    | MySQL                 |
| Build Tool  | Gradle                |
| Frontend    | React + TypeScript    |
| HTTP Client | Axios                 |
| Styling     | Tailwind CSS          |

---

# 🏗 아키텍처 설계 방향

DevMate는 **도메인 중심 구조(Domain Driven Structure)** 기반으로 설계되었습니다.

### 설계 원칙

* 도메인 기반 패키지 구조
* DTO 계층 분리
* Service / ServiceImpl 구조
* JWT 기반 Stateless 인증
* LAZY 로딩 기반 JPA 설계
* 확장 가능한 구조

👉 향후 MSA 전환을 고려한 **Monolithic 구조**로 설계되었습니다

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

# 🔐 인증 구조

DevMate는 **JWT 기반 인증 시스템**을 사용합니다.

### 인증 방식

* Access Token
* Refresh Token (DB 저장 + Hash)

### 인증 흐름

1. 로그인 성공 시 Access / Refresh Token 발급
2. Access Token 만료 시 재발급
3. 로그아웃 시 Refresh Token 삭제
4. 탈퇴 시 모든 토큰 무효화

### 보안 설계

* BCrypt 비밀번호 암호화
* Refresh Token 해시 저장
* Stateless 인증 구조
* 탈퇴 회원 로그인 차단

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

# ✨ 주요 기능

## 🔐 회원 기능

* 회원가입 / 로그인 / 로그아웃
* 내 정보 수정
* 회원 탈퇴

📌 탈퇴정책
* 스터디 리더인 경우 탈퇴 불가
---

## 💬 커뮤니티

* 게시글 작성 / 조회 / 수정 / 삭제
* 댓글 작성 / 수정 / 삭제
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
* 인기 멤버 시스템

👉 인기 점수 구성:

```
게시글 좋아요 + 댓글 좋아요 + 프로필 좋아요
```

---

## 👤 프로필 시스템

* 공개 프로필 페이지
* 프로필 이미지 업로드
* 프로필 좋아요 기능
* 인기 멤버 정렬

---

## 🤝 스터디

* 스터디 생성 / 참가 / 탈퇴
* 스터디 멤버 관리
* 리더 위임
* 모집 상태 관리

---

## 🏢 예약 시스템

* 개인 / 스터디 예약
* 시간 충돌 방지
* 예약 취소

📌 예약 정책

* 1회 최소 1시간 / 최대 3시간
* 하루 최대 5시간
* 과거 시간 예약 불가

---

## 🔔 알림 시스템

### 알림 종류

* 댓글 작성
* 댓글 채택
* 스터디 관련 이벤트
* 예약 관련 이벤트

### 기능

* 읽음 / 안읽음
* 전체 읽음 처리
* 클릭 시 해당 페이지 이동

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

* 실시간 알림
* 인기 멤버 고도화
* 추천 스터디 시스템
* Redis 기반 인증 개선

---

# 🎯 프로젝트 목표

DevMate는 단순 CRUD가 아닌

* 실무 수준의 Spring Boot 아키텍처 설계
* JWT 인증 시스템 구현 경험
* 도메인 중심 설계 경험
* React + Spring Boot 통합 경험

을 목표로 개발되었습니다.
