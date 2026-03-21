# 🚀 DevMate

> 개발 고민을 공유하고
> 
> 댓글 채택을 통해 문제를 해결하며
> 
> 스터디 모집과 예약까지 이어지
> **개발자 커뮤니티 + 스터디 플랫폼**

---

# 🧠 프로젝트 소개

DevMate는 개발자들이  **문제 해결 → 스터디 참여 → 실제 활동**까지 이어질 수 있도록 설계된 플랫폼입니다.
단순 CRUD 프로젝트가 아니라  
Spring Boot 기반 **실무 아키텍처 설계와 확장 가능한 구조 설계 경험**을 목표로 개발되었습니다.

- 🔐 JWT 기반 인증 시스템
- 💬 개발 고민 공유 게시판
- 🤝 댓글을 통한 커뮤니티 기반 문제 해결
- 🏢 스터디룸 예약 시스템

---

# ⚙ 기술 스택

| 구분 | 기술 |
|-----|------|
| Backend | Spring Boot |
| Language | Java 17 |
| ORM | Spring Data JPA |
| Security | Spring Security + JWT |
| Database | MySQL |
| Build Tool | Gradle |
| Frontend | React + TypeScript |
| HTTP Client | Axios |

---

# 🏗 아키텍처 설계 방향

DevMate는 **도메인 중심 구조(Domain Driven Structure)** 기반으로 설계되었습니다.

### 설계 원칙

- 도메인 기반 패키지 구조
- DTO 계층 분리
- Service / ServiceImpl 구조
- JWT 기반 Stateless 인증
- LAZY 로딩 기반 JPA 설계
- 확장 가능한 구조

향후 MSA 전환을 고려한 **Monolithic 구조**로 설계되었습니다.

---

# 📂 Project Structure

```
src/main/java/com/devs/devmate

├── global        # 공통 설정, JWT, Security, Exception
├── auth          # 로그인 / 토큰 발급
├── member        # 회원 관리
├── post          # 고민 게시글
├── comment       # 댓글 기능
├── reservation   # 스터디룸 예약
├── study         # 스터디 모집 / 참여 / 운영
├── notification  # 알림

└── DevmateApplication.java

```

```
**Domain Layer Example**
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

- Access Token
- Refresh Token (DB 저장 + Hash)

### 인증 흐름

1. 로그인 성공 시 Access Token / Refresh Token 발급
2. Access Token 만료 시 Refresh Token으로 재발급
3. 로그아웃 시 Refresh Token 삭제
4. 탈퇴 시 토큰 전체 삭제

### 보안 설계

- BCrypt 비밀번호 암호화
- Refresh Token 해시 저장
- Stateless 인증 구조
- 탈퇴 회원 로그인 차단

---

# 🗄 주요 도메인

## Member

| 컬럼         | 설명               |
| ---------- | ---------------- |
| id         | PK               |
| email      | 로그인 ID           |
| password   | BCrypt 암호화       |
| name       | 사용자 이름           |
| nickname   | 닉네임              |
| phone      | 연락처              |
| bio        | 한 줄 소개           |
| status     | ACTIVE / DELETED |
| role       | USER / ADMIN     |
| created_at | 생성 시간            |
| updated_at | 수정 시간            |

👉 탈퇴 시:
- 계정 비활성화 (DELETED)
- 기존 데이터는 유지 (작성자 = "탈퇴한 회원")

---

# ✨ 주요 기능

## 🔐 회원 기능
- 회원가입
- 로그인 / 로그아웃
- 내 정보 조회 / 수정
- 회원탈퇴

### 탈퇴 정책
- 스터디 리더인 경우 탈퇴 불가
- 참여 중 스터디 자동 탈퇴
- 예약 자동 취소
- 토큰 삭제

## 💬 커뮤니티

- 게시글 작성 / 조회 / 수정 /삭제
- 댓글 작성 / 수정 / 삭제
- 댓글 채택 기능
- 고민 해결 여부 처리
- 게시글 타입 분리
   -  QUESTION : 개발 고민 게시글
   -  STUDY : 스터디 모집 게시글

---

## 🤝 스터디

- 스터디 생성 / 참가 / 탈퇴
- 스터디 멤버 조회
- 리더 위임
- 모집 마감 / 재오픈
- 내 스터디 조회
- 스터디 공지 관리

---

## 🏢 예약 시스템

- 개인 / 스터디 예약
- 예약 시간 충돌 방지
- 내 예약 조회
- 예약 취소

## 📌예약 정책
 - 1회 예약 최소 1시간 / 최대 3시간
 - 하루 최대 3회 예약 최대 5시간 가능 (개인당)
 - 과거 시간 예약 불가
 - 스터디 멤버 간 일정 충돌 방지
 - 예약 시간 1시간 전까지만 취소가능
   
  ** 예약 방식 **

   DevMate의 예약 시스템은 **시간 슬롯 기반 예약 방식**을 사용합니다.
09:00 ~ 10:00
10:00 ~ 11:00
11:00 ~ 12:00

---

## 🔔 알림 시스템

사용자 상호작용을 기반으로 한 **이벤트 기반 알림 기능**

### 알림 종류
- 댓글 작성 알림
- 댓글 채택 알림
- 스터디 공지 수정 알림
- 스터디 참가 알림
- 스터디 예약 생성 알림

### 기능
- 읽음 / 안읽음
- 전체 읽음 처리
- 알림 목록 조회
- 알림 클릭 시 해당 페이지 이동

---

# 📡 API Example
게시글 생성
POST /api/posts

Request

{
  "title": "Spring Security JWT 질문",
  "content": "JWT 구조가 궁금합니다."
}

Response

{
  "success": true,
  "data": {
    "id": 1
  }
}

---
# 🚀 실행 방법

```bash
# 1. 프로젝트 클론
git clone https://github.com/JangWonJong/devmate.git

# 2. 디렉토리 이동
cd devmate

# 3. 실행
./gradlew bootRun
```

---

**📌 향후 개선 계획**

- 예약 취소 알림 추가
- UI 컴포넌트 분리
- Redis 기반 토큰 관리
- 관리자 기능

---

**🎯 프로젝트 목표**

DevMate 프로젝트의 목표는

실무 수준의 Spring Boot 아키텍처 복습

JWT 인증 시스템 설계 경험

JPA 기반 도메인 설계

React + Spring Boot 연동 경험입니다.

---
