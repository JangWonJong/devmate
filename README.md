# 🚀 DevMate

> 개발 고민을 공유하고, 함께 해결하며,  
> 스터디룸을 예약할 수 있는 개발자 커뮤니티 플랫폼

![Java](https://img.shields.io/badge/Java-17-blue)
![Spring](https://img.shields.io/badge/SpringBoot-4-green)
![JPA](https://img.shields.io/badge/JPA-Hibernate-orange)
![MySQL](https://img.shields.io/badge/MySQL-8-blue)

---

## 🧠 프로젝트 소개

DevMate는 개발자들이 다음과 같은 활동을 할 수 있도록 설계된 플랫폼입니다.

- 💬 개발 고민 공유
- 🤝 커뮤니티 기반 문제 해결
- 🏢 스터디룸 예약 시스템
- 🔐 JWT 기반 인증 시스템

단순 CRUD 프로젝트가 아니라  
**실무 아키텍처 감각 복구 및 확장 가능한 구조 설계**를 목표로 개발 중입니다.

---

## 🏗 아키텍처 설계 방향

### ✔ Monolithic 기반 → MSA 전환 가능 구조

- 도메인 중심 패키지 설계
- Service / ServiceImpl 분리
- DTO 계층 분리
- JWT 기반 인증 설계
- 계층 간 의존성 최소화

---

## 📂 Project Structure

```
src/main/java/com/devs/devmate
│
├── global
│   ├── config
│   ├── exception
│   └── common
│
├── member
│   ├── controller
│   ├── service
│   │   ├── MemberService.java
│   │   └── MemberServiceImpl.java
│   ├── repository
│   ├── entity
│   └── dto
│
└── DevmateApplication.java
```
## 🗄 ERD

### 📌 Member

| 컬럼 | 설명 |
|------|------|
| id | PK |
| email | 로그인 ID (unique) |
| password | BCrypt 암호화 |
| nickname | 닉네임 |
| role | USER / ADMIN |
| created_at | 생성 시간 |
| updated_at | 수정 시간 |

### 📌 RefreshToken

| 컬럼 | 설명 |
|------|------|
| id | PK |
| member_id | FK |
| token_hash | SHA-256 해시 저장 |
| expires_at | 만료 시간 |
| revoked_at | 로그아웃 처리 시 기록 |

관계:

Member (1) ---- (N) RefreshToken
- `@ManyToOne(fetch = LAZY)` 단방향 설계

---

## 🔐 인증 구조

### 인증 전략

- Access Token (짧은 만료시간)
- Refresh Token (DB 저장)
- Stateless 기반 구조
- 향후 Redis 적용 가능

### 보안 설계 원칙

- BCrypt 비밀번호 암호화
- Refresh Token 해시 저장
- 모든 연관관계 LAZY 전략
- Service 계층에서 비즈니스 로직 처리

---

## ⚙ 기술 스택

| 구분 | 기술 |
|------|------|
| Backend | Spring Boot 4 |
| ORM | Spring Data JPA |
| Database | MySQL 8 |
| Security | Spring Security |
| Build Tool | Gradle |
| Java | 17 |
| 예정 | JWT (Access / Refresh) |

---

## 🚀 실행 방법

```bash
# 1. 프로젝트 클론
git clone https://github.com/JangWonJong/devmate.git

# 2. 디렉토리 이동
cd devmate

# 3. 실행
./gradlew bootRun
