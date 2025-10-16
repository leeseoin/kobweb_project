# 📋 KOB Backend - TODO List

**최종 업데이트**: 2025-10-15
**프로젝트**: Spring Boot WebSocket Chat System

---

## 🔥 긴급 (Urgent)

### 1. 프론트엔드 WebSocket Destination 수정
**우선순위**: ⭐⭐⭐⭐⭐
**상태**: 🔜 대기 중

**작업 내용**:
```typescript
// 파일: useWebSocket.ts (또는 WebSocket 관련 파일)
// ❌ 수정 전
const destination = `/topic/chat/${roomId}`;

// ✅ 수정 후
const destination = `/topic/rooms.${roomId}`;
```

**확인 사항**:
- [ ] 채팅방 구독 로직 확인
- [ ] Destination 생성 부분 찾기
- [ ] `/topic/chat/` 패턴 검색
- [ ] 테스트: 메시지 전송/수신 확인

**예상 소요 시간**: 10분

---

## 🎯 중요 (Important)

### 2. WebSocket Principal null 문제 해결
**우선순위**: ⭐⭐⭐⭐
**상태**: 🔍 조사 필요

**현재 문제**:
```
로그: Principal: null
로그: 인증되지 않은 WebSocket 연결 시도
```

**원인 추정**:
- Handshake에서는 Principal 설정 성공
- STOMP CONNECT 시점에 Principal이 사라짐
- ChannelInterceptor의 Principal 복원 로직 문제

**해결 가이드라인**:
1. `WebSocketConfig.java` - `configureClientInboundChannel()` 검토
2. SessionAttributes에서 Principal 복원 로직 강화
3. STOMP CONNECT 시점에 Principal 설정 확인
4. 테스트: CONNECT 후 Principal이 null이 아닌지 확인

**참고 파일**:
- `WebSocketConfig.java:74-110`
- `JwtHandshakeInterceptor.java`

**예상 소요 시간**: 1-2시간

---

### 3. 채팅 메시지 캐싱 전략 구현
**우선순위**: ⭐⭐⭐
**상태**: 📝 설계 필요

**현재 상황**:
```
로그: === 캐시 미스 - DB에서 조회 (캐시 비활성화) ===
```

**작업 내용**:
- Redis 캐시 활성화 (현재 비활성화 상태)
- 최근 메시지 캐싱 전략 수립
- 캐시 무효화 로직 구현

**캐싱 전략 (제안)**:
```
1. 채팅방별 최근 30개 메시지 캐싱
2. TTL: 30분
3. 새 메시지 저장 시 캐시 업데이트
4. 캐시 키: chatMessages:{roomId}_null_30
```

**참고 파일**:
- `RedisChatService.java`
- `ChatService.java`

**예상 소요 시간**: 2-3시간

---

## 💡 개선 (Enhancement)

### 4. 로깅 시스템 개선
**우선순위**: ⭐⭐⭐
**상태**: 📋 계획 중

**현재 문제**:
- 콘솔 로그만 사용 중
- 로그 레벨 관리 부족
- 운영 환경에서 로그 추적 어려움

**작업 내용**:
1. **Logback 설정**
   ```xml
   <!-- logback-spring.xml -->
   - 파일 기반 로깅
   - 일별 로그 롤링
   - 로그 레벨: INFO/DEBUG/ERROR 분리
   ```

2. **로그 정리**
   - 디버그 로그 (`🔍`, `💾`, `✅`) 정리
   - 운영 필수 로그만 남기기
   - 민감 정보 로깅 방지

3. **로그 모니터링**
   - ELK Stack 고려 (선택사항)
   - 로그 집계 및 분석

**예상 소요 시간**: 2-4시간

---

### 5. 에러 처리 개선
**우선순위**: ⭐⭐⭐
**상태**: 🔧 부분 구현됨

**현재 상황**:
- WebSocket 에러 처리 기본 구현됨
- 일부 에러가 클라이언트에 제대로 전달 안 됨

**작업 내용**:
1. **Global Exception Handler**
   ```java
   @ControllerAdvice
   public class WebSocketExceptionHandler {
       // 통합 에러 처리
   }
   ```

2. **에러 응답 표준화**
   ```java
   {
     "type": "error",
     "code": "CHAT_ROOM_NOT_FOUND",
     "message": "채팅방을 찾을 수 없습니다",
     "timestamp": 1234567890
   }
   ```

3. **에러 로깅 강화**
   - Stack trace 로깅
   - 에러 발생 컨텍스트 기록

**예상 소요 시간**: 2-3시간

---

### 6. Hibernate N+1 쿼리 최적화
**우선순위**: ⭐⭐
**상태**: ⚠️ 경고 있음

**현재 문제**:
```
WARN: HHH90003004: firstResult/maxResults specified with collection fetch;
      applying in memory
```

**작업 내용**:
1. **채팅방 목록 조회 최적화**
   ```java
   // ChatRoomRepository.java
   @Query("SELECT DISTINCT cr FROM ChatRoom cr " +
          "LEFT JOIN FETCH cr.participants " +
          "LEFT JOIN FETCH cr.creator " +
          "WHERE ...")
   ```

2. **Batch Size 설정**
   ```yaml
   # application.yml
   spring:
     jpa:
       properties:
         hibernate:
           default_batch_fetch_size: 100
   ```

3. **DTO Projection 고려**
   - 필요한 필드만 조회
   - 성능 개선

**참고 파일**:
- `ChatRoomRepository.java`
- `ChatService.java`

**예상 소요 시간**: 3-4시간

---

## 🚀 기능 추가 (Feature)

### 7. 채팅 메시지 읽음 표시 (Read Receipt)
**우선순위**: ⭐⭐
**상태**: 🆕 신규

**기능 설명**:
- 메시지 읽음/안 읽음 상태 관리
- 읽지 않은 메시지 개수 표시
- 읽음 표시 실시간 업데이트

**구현 가이드라인**:
1. **DB 테이블 설계**
   ```sql
   CREATE TABLE message_read_status (
     message_id UUID,
     user_id UUID,
     read_at TIMESTAMP,
     PRIMARY KEY (message_id, user_id)
   );
   ```

2. **Redis 활용**
   - 읽지 않은 메시지 수 캐싱
   - 키: `unread:{userId}:{roomId}`

3. **WebSocket 이벤트**
   ```java
   @MessageMapping("/mark-read")
   public void markAsRead(...) {
     // 읽음 처리 로직
     // 실시간 브로드캐스트
   }
   ```

**예상 소요 시간**: 1일

---

### 8. 파일 첨부 기능
**우선순위**: ⭐⭐
**상태**: 🆕 신규

**기능 설명**:
- 이미지, 파일 전송 지원
- S3 또는 로컬 스토리지 연동
- 썸네일 생성

**구현 가이드라인**:
1. **파일 업로드 API**
   ```java
   @PostMapping("/chat/upload")
   public FileUploadResponse uploadFile(@RequestParam MultipartFile file) {
     // S3 업로드
     // URL 반환
   }
   ```

2. **메시지 타입 확장**
   ```java
   enum MessageType {
     TEXT,
     IMAGE,
     FILE,
     AUDIO,
     VIDEO
   }
   ```

3. **썸네일 생성** (이미지)
   - ImageMagick 또는 Java BufferedImage
   - 비동기 처리

**예상 소요 시간**: 2-3일

---

### 9. 채팅방 나가기 / 삭제 기능
**우선순위**: ⭐⭐
**상태**: 🆕 신규

**기능 설명**:
- 채팅방 나가기 (참여자 제거)
- 채팅방 삭제 (생성자만)
- 마지막 참여자 나가면 자동 삭제

**구현 가이드라인**:
1. **API 엔드포인트**
   ```java
   @PostMapping("/chat/rooms/{roomId}/leave")
   @DeleteMapping("/chat/rooms/{roomId}")
   ```

2. **비즈니스 로직**
   - 참여자 수 체크
   - 마지막 참여자 시 방 삭제
   - 관련 메시지 처리 (보관/삭제)

3. **WebSocket 알림**
   - 나간 사람에게 알림
   - 남은 참여자들에게 알림

**예상 소요 시간**: 4-6시간

---

## 🔧 인프라 (Infrastructure)

### 10. Docker Compose 구성
**우선순위**: ⭐⭐⭐
**상태**: ⚠️ 부분 완료 (RabbitMQ만)

**현재 상황**:
- RabbitMQ: Docker로 실행 중 ✅
- PostgreSQL: 로컬 설치
- Neo4j: 로컬 설치
- Redis: 로컬 설치

**작업 내용**:
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: kob_backend
      POSTGRES_USER: iseoin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  neo4j:
    image: neo4j:5.13
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      NEO4J_AUTH: neo4j/password
    volumes:
      - neo4j_data:/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:4.2-rc-management
    ports:
      - "5672:5672"
      - "15672:15672"
      - "61613:61613"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest

  spring-boot:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - neo4j
      - redis
      - rabbitmq
    environment:
      SPRING_PROFILES_ACTIVE: docker

volumes:
  postgres_data:
  neo4j_data:
  redis_data:
```

**예상 소요 시간**: 2-3시간

---

### 11. CI/CD 파이프라인 구축
**우선순위**: ⭐⭐
**상태**: 🆕 신규

**작업 내용**:
1. **GitHub Actions 설정**
   ```yaml
   # .github/workflows/ci.yml
   - Build & Test
   - Docker Image Build
   - Deploy to Dev/Staging
   ```

2. **자동화 범위**
   - 코드 푸시 시 자동 테스트
   - PR 시 빌드 검증
   - Main 브랜치 머지 시 배포

3. **배포 환경**
   - Dev: 자동 배포
   - Staging: 수동 승인
   - Production: 수동 승인 + 롤백 준비

**예상 소요 시간**: 1-2일

---

## 📚 문서화 (Documentation)

### 12. API 문서화 (Swagger/OpenAPI)
**우선순위**: ⭐⭐
**상태**: ❌ 없음

**작업 내용**:
```java
// pom.xml 또는 build.gradle
implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.2.0'

// SwaggerConfig.java
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("KOB Backend API")
                .version("v1.0")
                .description("채팅 및 명함 관리 API"));
    }
}
```

**접근 URL**: `http://localhost:8080/swagger-ui.html`

**예상 소요 시간**: 3-4시간

---

### 13. WebSocket 프로토콜 문서화
**우선순위**: ⭐⭐
**상태**: ❌ 없음

**작업 내용**:
1. **연결 방법**
   ```
   URL: ws://localhost:8080/ws/chat?token={JWT_TOKEN}
   Protocol: STOMP over SockJS
   ```

2. **메시지 형식**
   ```json
   {
     "type": "chat.message",
     "messageId": "uuid",
     "timestamp": 1234567890,
     "payload": {
       "content": "메시지 내용",
       "roomId": "uuid",
       "senderId": "uuid"
     }
   }
   ```

3. **엔드포인트 목록**
   - `/app/send-message`
   - `/app/create-room`
   - `/topic/rooms.{roomId}`
   - `/user/queue/rooms`

**예상 소요 시간**: 2-3시간

---

## 🧪 테스트 (Testing)

### 14. 단위 테스트 작성
**우선순위**: ⭐⭐⭐
**상태**: ⚠️ 부족

**작업 내용**:
1. **Service Layer 테스트**
   ```java
   @SpringBootTest
   class ChatMessageServiceTest {
       @Test
       void saveMessage_성공() {
           // Given
           // When
           // Then
       }
   }
   ```

2. **Repository 테스트**
   - JPA Repository 메서드 테스트
   - 쿼리 성능 테스트

3. **테스트 커버리지**
   - 목표: 80% 이상
   - JaCoCo 설정

**예상 소요 시간**: 2-3일

---

### 15. WebSocket 통합 테스트
**우선순위**: ⭐⭐
**상태**: ❌ 없음

**작업 내용**:
```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class WebSocketIntegrationTest {

    @Test
    void 메시지_전송_및_수신_테스트() {
        // STOMP 연결
        // 메시지 전송
        // 수신 확인
        // DB 저장 확인
    }
}
```

**예상 소요 시간**: 1일

---

## 🔐 보안 (Security)

### 16. WebSocket 보안 강화
**우선순위**: ⭐⭐⭐
**상태**: ⚠️ 기본만 구현

**작업 내용**:
1. **JWT 토큰 갱신 메커니즘**
   - Access Token 만료 시 자동 갱신
   - Refresh Token 구현

2. **Rate Limiting**
   ```java
   // 메시지 전송 제한: 10개/초
   @RateLimiter(name = "chatMessage", fallbackMethod = "rateLimitFallback")
   ```

3. **메시지 크기 제한**
   ```java
   // 최대 메시지 크기: 10KB
   @Configuration
   public class WebSocketConfig {
       @Override
       public void configureWebSocketTransport(
           WebSocketTransportRegistration registration) {
           registration.setMessageSizeLimit(10240); // 10KB
       }
   }
   ```

**예상 소요 시간**: 1-2일

---

### 17. XSS 방지
**우선순위**: ⭐⭐⭐
**상태**: ❌ 미구현

**작업 내용**:
1. **메시지 내용 Sanitization**
   ```java
   import org.owasp.html.PolicyFactory;

   public String sanitize(String message) {
       return policyFactory.sanitize(message);
   }
   ```

2. **HTML 태그 필터링**
   - 허용된 태그만 통과
   - 스크립트 태그 제거

**예상 소요 시간**: 4-6시간

---

## 📊 모니터링 (Monitoring)

### 18. 성능 모니터링
**우선순위**: ⭐⭐
**상태**: 🆕 신규

**작업 내용**:
1. **Spring Actuator 활성화**
   ```yaml
   management:
     endpoints:
       web:
         exposure:
           include: health,metrics,prometheus
   ```

2. **Prometheus + Grafana**
   - 메트릭 수집
   - 대시보드 구성
   - 알림 설정

3. **모니터링 지표**
   - WebSocket 연결 수
   - 메시지 처리 속도
   - DB 쿼리 성능
   - JVM 메모리 사용량

**예상 소요 시간**: 1-2일

---

## 🗂️ 우선순위 요약

### 이번 주 (Week 1)
1. ✅ **프론트엔드 Destination 수정** (10분)
2. ⭐ **Principal null 문제 해결** (1-2시간)
3. ⭐ **로깅 시스템 개선** (2-4시간)

### 다음 주 (Week 2)
4. **캐싱 전략 구현** (2-3시간)
5. **에러 처리 개선** (2-3시간)
6. **N+1 쿼리 최적화** (3-4시간)

### 다다음 주 (Week 3)
7. **읽음 표시 기능** (1일)
8. **Docker Compose 구성** (2-3시간)
9. **단위 테스트 작성** (2-3일)

### 추후 (Backlog)
- 파일 첨부 기능
- 채팅방 나가기/삭제
- CI/CD 파이프라인
- API 문서화
- WebSocket 통합 테스트
- 보안 강화
- 성능 모니터링

---

## 📝 참고 사항

### 진행 시 체크리스트
- [ ] 작업 시작 전 브랜치 생성 (`feature/작업명`)
- [ ] 코드 리뷰 (가능하면)
- [ ] 테스트 작성
- [ ] 문서 업데이트
- [ ] PR 생성 및 머지

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드, 설정 변경
```

---

**마지막 수정**: 2025-10-15
**다음 검토**: 1주일 후
