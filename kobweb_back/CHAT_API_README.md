# 채팅 API 문서

## 개요
실시간 채팅 및 메시지 관리 API입니다. REST API와 WebSocket을 통해 채팅 기능을 제공합니다.

## REST API

### 1. 내 채팅방 목록 조회
- **Endpoint**: `GET /api/chat/rooms`
- **Authorization**: `Bearer Token` 필요
- **Query Parameters**:
  - `page` (기본값: 0): 페이지 번호
  - `size` (기본값: 10): 페이지 크기
- **Response**: 채팅방 목록 (각 채팅방 정보, 참여자, 마지막 메시지, 안 읽은 메시지 수 포함)

### 2. 특정 채팅방 메시지 내역 조회
- **Endpoint**: `GET /api/chat/rooms/{roomId}/messages`
- **Authorization**: `Bearer Token` 필요
- **Path Parameters**: `roomId`
- **Query Parameters**:
  - `lastMessageId` (선택): 이 ID를 기준으로 이전 메시지 조회 (무한 스크롤)
  - `size` (기본값: 30): 조회할 메시지 개수
- **Response**: 해당 채팅방의 메시지 목록

### 3. 메시지 전송 (DB 기록용)
- **Endpoint**: `POST /api/chat/rooms/{roomId}/messages`
- **Authorization**: `Bearer Token` 필요
- **Path Parameters**: `roomId`
- **Request Body**:
  ```json
  {
    "content": "전송할 메시지 내용"
  }
  ```
- **Response**: 생성된 메시지 정보

### 4. 채팅방 생성
- **Endpoint**: `POST /api/chat/rooms`
- **Authorization**: `Bearer Token` 필요
- **Query Parameters**:
  - `roomName`: 채팅방 이름
  - `participantIds`: 참여자 ID 목록 (콤마로 구분)
- **Response**: 생성된 채팅방 정보

### 5. 채팅방에 참여자 추가
- **Endpoint**: `POST /api/chat/rooms/{roomId}/participants/{participantId}`
- **Authorization**: `Bearer Token` 필요
- **Path Parameters**: `roomId`, `participantId`
- **Response**: 성공 메시지

### 6. 채팅방에서 참여자 제거
- **Endpoint**: `DELETE /api/chat/rooms/{roomId}/participants/{participantId}`
- **Authorization**: `Bearer Token` 필요
- **Path Parameters**: `roomId`, `participantId`
- **Response**: 성공 메시지

## WebSocket API

### 연결
- **Endpoint**: `ws://localhost:8080/ws/chat`
- **Connection**: 연결 시 헤더에 `Authorization: Bearer {accessToken}` 전달

### 메시지 프로토콜
모든 메시지는 `type`과 `payload`를 가진 JSON 형식입니다.

### 클라이언트 → 서버 이벤트

#### 1. 채팅방 구독
```json
{
  "type": "SUBSCRIBE",
  "payload": {
    "roomId": "채팅방_UUID"
  }
}
```

#### 2. 메시지 발신
```json
{
  "type": "SEND_MESSAGE",
  "payload": {
    "roomId": "채팅방_UUID",
    "content": "메시지 내용"
  }
}
```

### 서버 → 클라이언트 이벤트

#### 1. 새 메시지 수신
```json
{
  "type": "NEW_MESSAGE",
  "payload": {
    "messageId": "메시지_UUID",
    "roomId": "채팅방_UUID",
    "content": "메시지 내용",
    "sender": {
      "id": "발신자_UUID",
      "nickname": "발신자 닉네임"
    },
    "sentAt": "2024-01-01T12:00:00"
  }
}
```

#### 2. 구독 성공
```json
{
  "type": "SUBSCRIBE_SUCCESS",
  "payload": "채팅방 이름에 성공적으로 구독했습니다."
}
```

#### 3. 오류 발생
```json
{
  "type": "ERROR",
  "payload": {
    "error": "에러_타입",
    "message": "에러 메시지"
  }
}
```

## 사용 예시

### JavaScript 클라이언트 예시

```javascript
// WebSocket 연결
const socket = new WebSocket('ws://localhost:8080/ws/chat');

// 연결 시 토큰 전달
socket.onopen = function() {
    // 연결 후 구독 요청
    socket.send(JSON.stringify({
        type: 'SUBSCRIBE',
        payload: {
            roomId: '채팅방_UUID'
        }
    }));
};

// 메시지 수신
socket.onmessage = function(event) {
    const message = JSON.parse(event.data);
    
    switch(message.type) {
        case 'NEW_MESSAGE':
            console.log('새 메시지:', message.payload);
            break;
        case 'SUBSCRIBE_SUCCESS':
            console.log('구독 성공:', message.payload);
            break;
        case 'ERROR':
            console.error('에러:', message.payload);
            break;
    }
};

// 메시지 전송
function sendMessage(roomId, content) {
    socket.send(JSON.stringify({
        type: 'SEND_MESSAGE',
        payload: {
            roomId: roomId,
            content: content
        }
    }));
}
```

## 데이터베이스 스키마

### ChatRoom 테이블
- `id` (UUID, PK): 채팅방 ID
- `name` (VARCHAR): 채팅방 이름
- `creator_id` (UUID, FK): 생성자 ID
- `created_at` (TIMESTAMP): 생성일시

### ChatMessage 테이블
- `id` (UUID, PK): 메시지 ID
- `content` (TEXT): 메시지 내용
- `sender_id` (UUID, FK): 발신자 ID
- `chat_room_id` (UUID, FK): 채팅방 ID
- `sent_at` (TIMESTAMP): 전송일시

### chat_room_participants 테이블 (다대다 관계)
- `chat_room_id` (UUID, FK): 채팅방 ID
- `user_id` (UUID, FK): 사용자 ID

## 에러 코드

- `USER_NOT_FOUND`: 사용자를 찾을 수 없음
- `CHAT_ROOM_NOT_FOUND`: 채팅방을 찾을 수 없음
- `USER_NOT_IN_CHAT_ROOM`: 사용자가 해당 채팅방에 참여하지 않음
- `INVALID_INPUT`: 잘못된 입력
- `UNAUTHORIZED`: 인증되지 않은 요청
- `FORBIDDEN`: 권한 없음
- `NOT_FOUND`: 리소스를 찾을 수 없음
- `ALREADY_EXISTS`: 이미 존재하는 리소스
- `INTERNAL_ERROR`: 내부 서버 오류 