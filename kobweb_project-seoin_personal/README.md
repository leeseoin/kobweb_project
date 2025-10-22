# KOB Backend

Spring Boot 기반 소셜 네트워킹 백엔드 서버

## 🚀 서버 실행 방법

### 1. Docker 컨테이너 실행
```bash
docker-compose up -d
```
- PostgreSQL (5432)
- RabbitMQ (5672, 15672, 61613)
- Neo4j (7474, 7687)
- Redis (6379)

### 2. Spring Boot 서버 실행
```bash
./gradlew bootRun
```
서버: http://localhost:8080

---

## ✅ 구현된 기능

### 사용자 인증
- 회원가입 / 로그인 (JWT)
- 이메일 중복 확인

### 친구 요청
- 친구 요청 전송 → 상대방 수락/거절
- 수락 시: 양방향 연락처 + 명함 자동 생성

### 명함 등록
- 이메일 기반 명함 등록 요청
- 시스템 가입자 → PENDING 상태 + 알림 전송
- 비가입자 → ACCEPTED 상태로 바로 저장
- 수락 시: 양방향 명함 생성 + Neo4j 친구 관계 추가
- **자기 자신 명함 등록 방지**

### 채팅
- WebSocket (STOMP + RabbitMQ)
- 1:1 / 그룹 채팅방
- 실시간 메시지 전송/수신
- 명함 기반 채팅방 생성

### 알림
- 친구 요청 알림 (CONNECTION 타입)
- 명함 등록 요청 알림 (BUSINESS_CARD_REQUEST 타입)
- 수락 시 자동 알림

### 네트워크
- Neo4j 기반 소셜 그래프
- 친구 관계 시각화
- 2촌 이내 추천

---

## ⚠️ 알려진 이슈

### WebSocket 관련
- ~~`/app/room-info` Invalid destination 에러~~ ✅ 해결됨
- **프론트엔드 구독 경로 확인 필요**: `/topic/chat/{roomId}` 사용 필수

### 읽음/안읽음 기능
- MessageReadStatus 도메인 존재
- **WebSocket 핸들러 미구현** (향후 추가 예정)

### 명함 등록
- 프론트엔드가 자기 이메일을 보내는 이슈 가능성 (백엔드 로그 확인 필요)

---

## 📝 API 문서

Swagger UI: http://localhost:8080/swagger-ui.html

### 주요 엔드포인트

**인증**
- `POST /api/v1/users/signup` - 회원가입
- `POST /api/v1/users/login` - 로그인

**명함**
- `POST /api/v1/business-cards` - 명함 등록 요청
- `POST /api/v1/business-cards/{id}/accept` - 요청 수락
- `POST /api/v1/business-cards/{id}/reject` - 요청 거절

**채팅**
- `POST /api/chat/rooms` - 1:1 채팅방 생성
- `POST /api/chat/rooms/business-card` - 명함 기반 채팅방 생성
- `GET /api/chat/rooms/{roomId}/messages` - 메시지 조회

**WebSocket**
- `/app/send-message` - 메시지 전송
- `/app/room-info` - 채팅방 정보 조회
- `/topic/chat/{roomId}` - 채팅 메시지 구독

---

## 🛠 기술 스택

- Spring Boot 3.x
- PostgreSQL (사용자, 채팅 데이터)
- Neo4j (소셜 그래프)
- RabbitMQ (WebSocket STOMP)
- Redis (캐시)
- JWT 인증
- WebSocket (STOMP)