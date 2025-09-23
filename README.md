# Kobweb Fullstack Project

Spring Boot + Next.js 기반의 비즈니스 카드 및 프로필 관리 시스템

## 🚀 빠른 시작

### 전체 환경 실행
```bash
# 방법 1: Windows 배치 파일 사용
start-dev.bat

# 방법 2: npm 스크립트 사용
npm install
npm run dev
```

### 개별 실행
```bash
# 백엔드만 실행
npm run dev:backend

# 프론트엔드만 실행
npm run dev:frontend
```

## 📂 프로젝트 구조

```
kobweb_project/
├── kobweb_back/          # Spring Boot 백엔드
│   ├── src/
│   └── build.gradle
├── kobweb_pront/         # Next.js 프론트엔드
│   ├── app/
│   ├── components/
│   └── package.json
├── package.json          # 루트 패키지 설정
└── start-dev.bat         # Windows 개발 환경 스크립트
```

## 🛠 기술 스택

### 백엔드
- **Framework**: Spring Boot 3.5.3
- **Language**: Java 21
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Build Tool**: Gradle

### 프론트엔드
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: npm

## 🔧 개발 환경 설정

### 1. 사전 요구사항
- Java 21+
- Node.js 18+
- PostgreSQL
- Git

### 2. 환경 변수 설정

**백엔드 (application.yml)**
```yaml
spring:
  profiles:
    active: dev
  datasource:
    url: jdbc:postgresql://localhost:5432/kob_backend
    username: your_username
    password: your_password
```

**프론트엔드 (.env.local)**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

### 3. 데이터베이스 설정
```sql
CREATE DATABASE kob_backend;
```

## 🌐 포트 정보
- **백엔드**: http://localhost:8080
- **프론트엔드**: http://localhost:3000
- **API 문서**: http://localhost:8080/swagger-ui.html

## 🔒 CORS 설정
- **개발 환경**: localhost:3000, 127.0.0.1:3000 허용
- **운영 환경**: 환경변수 ALLOWED_ORIGINS로 도메인 설정

## 📦 빌드 및 배포

### 개발 빌드
```bash
npm run build
```

### 프로덕션 배포
```bash
# 백엔드
cd kobweb_back
./gradlew build

# 프론트엔드
cd kobweb_pront
npm run build
```

## 🔍 주요 기능
- 사용자 인증 (JWT)
- 비즈니스 카드 관리
- 프로필 관리
- 실시간 채팅 (WebSocket)
- 알림 시스템

## 🤝 개발 가이드
1. 새 기능 개발 시 새 브랜치 생성
2. 백엔드 API 변경 시 프론트엔드 API 클라이언트 업데이트
3. CORS 설정 변경 시 보안 검토 필수