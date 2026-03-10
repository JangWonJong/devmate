# 🚀 DevMate

> 개발 고민을 공유하고
> 
> 댓글 채택 기능을 통해 문제를 해결하며
> 
> 스터디 모집 게시글과 스터디룸 예약을 통해
> 실제 스터디 활동까지 이어갈 수 있도록 설계된 개발자 커뮤니티 플랫폼

---

# 🧠 프로젝트 소개

DevMate는 개발자들이 다음과 같은 활동을 할 수 있도록 설계된 플랫폼입니다.

- 🔐 JWT 기반 인증 시스템
- 💬 개발 고민 공유 게시판
- 🤝 댓글을 통한 커뮤니티 기반 문제 해결
- 🏢 스터디룸 예약 시스템

단순 CRUD 프로젝트가 아니라  
Spring Boot 기반 **실무 아키텍처 설계와 확장 가능한 구조 설계 경험**을 목표로 개발되었습니다.

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

DevMate는 **도메인 중심 구조(Domain Driven Structure)**를 기반으로 설계되었습니다.

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
- Refresh Token (DB 저장)

### 보안 설계

- BCrypt 비밀번호 암호화
- Refresh Token 해시 저장
- Stateless 인증 구조
- Spring Security Filter 기반 인증 처리

---

# 🗄 주요 도메인

## Member

| 컬럼 | 설명 |
|----|----|
| id | PK |
| email | 로그인 ID |
| password | BCrypt 암호화 |
| nickname | 닉네임 |
| role | USER / ADMIN |
| created_at | 생성 시간 |
| updated_at | 수정 시간 |

---

# ✨ 주요 기능

## 게시글 기능

- 게시글 작성 / 조회 / 수정 /삭제
- 고민 해결 여부 처리
- 검색 / 페이징 / 정렬 기능
- 게시글 타입 분리
   -  QUESTION : 개발 고민 게시글
   -  STUDY : 스터디 모집 게시글

---

## 댓글 기능

- 댓글 작성 / 조회 / 수정 / 삭제
- 댓글 채택 기능
- 채택 댓글 상단 고정

---

## 스터디 기능

- 스터디 생성 / 참가 / 탈퇴
- 스터디 멤버 조회
- 리더 위임
- 모집 마감
- 내 스터디 조회

   ** 스터디 운영 정책 **
 *  모집중
 → 자유 참가 / 탈퇴 가능
 *   모집 마감
 → 직접 탈퇴 불가
 → 댓글을 통해 리더에게 요청 가능

---

## 스터디룸 예약 시스템

- 스터디룸 예약
- 예약 시간 충돌 방지
- 내 예약 조회
- 예약 취소

  ** 예약 방식 **

   DevMate의 예약 시스템은 **시간 슬롯 기반 예약 방식**을 사용합니다.
09:00 ~ 10:00
10:00 ~ 11:00
11:00 ~ 12:00

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

- 공통 UI 컴포넌트 분리

- 마이페이지 기능

- Redis 기반 Refresh Token 관리

- 알림 시스템

- 스터디 기반 예약 기능 확장 

---

**🎯 프로젝트 목표**

DevMate 프로젝트의 목표는

실무 수준의 Spring Boot 아키텍처 복습

JWT 인증 시스템 설계 경험

JPA 기반 도메인 설계

React + Spring Boot 연동 경험

입니다.

---
