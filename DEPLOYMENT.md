# 배포 가이드

이 문서는 Kobweb Fullstack 프로젝트의 배포 방법을 설명합니다.

## 📋 사전 준비사항

### 시스템 요구사항
- Docker 20.0+
- Docker Compose 2.0+
- Node.js 18+ (로컬 개발 시)
- Java 21+ (로컬 개발 시)
- PostgreSQL 15+ (별도 DB 서버 사용 시)

### 환경 변수 설정
운영 환경에 맞게 환경 변수를 설정해주세요.

## 🚀 배포 방법

### 1. Docker Compose를 이용한 전체 스택 배포

#### 운영 환경 배포
```bash
# 프로젝트 클론
git clone <repository-url>
cd kobweb_project

# 환경 변수 설정
cp kobweb_pront/.env.example kobweb_pront/.env.production
# .env.production 파일을 운영 환경에 맞게 수정

# Docker Compose로 전체 스택 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

#### 개발 환경 배포 (DB만 Docker 사용)
```bash
# 개발용 PostgreSQL, Redis만 실행
docker-compose -f docker-compose.dev.yml up -d

# 애플리케이션은 로컬에서 실행
npm run dev
```

### 2. 개별 서비스 배포

#### 백엔드만 배포
```bash
cd kobweb_back

# Docker 이미지 빌드
docker build -t kobweb-backend .

# 컨테이너 실행
docker run -d \
  --name kobweb-backend \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/kob_backend \
  -e SPRING_DATASOURCE_USERNAME=your-username \
  -e SPRING_DATASOURCE_PASSWORD=your-password \
  kobweb-backend
```

#### 프론트엔드만 배포
```bash
cd kobweb_pront

# Docker 이미지 빌드
docker build -t kobweb-frontend .

# 컨테이너 실행
docker run -d \
  --name kobweb-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api \
  kobweb-frontend
```

### 3. Nginx 리버스 프록시 사용

Nginx를 사용하여 프론트엔드와 백엔드를 하나의 도메인으로 통합할 수 있습니다.

```bash
# Nginx 설정이 포함된 전체 스택 실행
docker-compose up -d

# 접속
# - 프론트엔드: http://localhost
# - API: http://localhost/api
# - WebSocket: ws://localhost/ws
```

## 🔧 환경별 설정

### 운영 환경 (.env.production)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-production-domain.com/api
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_WS_URL=wss://your-production-domain.com/ws
NODE_ENV=production
```

### 스테이징 환경 (.env.staging)
```env
NEXT_PUBLIC_API_BASE_URL=https://staging-api.your-domain.com/api
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_WS_URL=wss://staging-api.your-domain.com/ws
NODE_ENV=staging
```

## 📊 모니터링 및 로그

### Health Check 엔드포인트
- **백엔드**: `http://your-domain:8080/actuator/health`
- **프론트엔드**: 자동 health check (Docker)

### 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 메트릭 확인
- **Actuator 메트릭**: `http://your-domain:8080/actuator/metrics`
- **애플리케이션 정보**: `http://your-domain:8080/actuator/info`

## 🛠 트러블슈팅

### 자주 발생하는 문제

#### 1. 데이터베이스 연결 실패
```bash
# PostgreSQL 컨테이너 상태 확인
docker-compose ps postgres

# 데이터베이스 로그 확인
docker-compose logs postgres

# 연결 테스트
docker-compose exec postgres psql -U iseoin -d kob_backend -c "SELECT 1;"
```

#### 2. CORS 오류
- `application.yml`의 `app.cors.allowed-origins` 설정 확인
- 프론트엔드 도메인이 허용 목록에 포함되어 있는지 확인

#### 3. 메모리 부족
```bash
# Docker 메모리 사용량 확인
docker stats

# JVM 메모리 설정 조정 (Dockerfile의 JAVA_OPTS)
ENV JAVA_OPTS="-Xms1024m -Xmx2048m"
```

#### 4. 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
netstat -an | grep :8080
netstat -an | grep :3000

# Docker Compose 포트 변경
services:
  backend:
    ports:
      - "8081:8080"  # 호스트 포트 변경
```

## 🔄 업데이트 및 롤백

### 애플리케이션 업데이트
```bash
# 최신 코드 가져오기
git pull origin main

# 이미지 재빌드 및 재시작
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 데이터베이스 백업
```bash
# 백업 생성
docker-compose exec postgres pg_dump -U iseoin kob_backend > backup.sql

# 백업 복원
docker-compose exec -T postgres psql -U iseoin kob_backend < backup.sql
```

### 롤백
```bash
# 이전 버전으로 롤백
git checkout <previous-commit>
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔐 보안 고려사항

1. **환경 변수**: 민감한 정보는 환경 변수로 관리
2. **HTTPS**: 운영 환경에서는 반드시 HTTPS 사용
3. **방화벽**: 필요한 포트만 외부에 노출
4. **데이터베이스**: 강력한 비밀번호 사용 및 접근 제한
5. **CORS**: 신뢰할 수 있는 도메인만 허용

## 📞 지원

문제가 발생하면 다음을 확인해주세요:

1. 로그 파일 (`docker-compose logs`)
2. Health check 엔드포인트
3. 환경 변수 설정
4. 네트워크 연결 상태

추가 지원이 필요하면 이슈를 생성해주세요.