# Next.js와 Spring Boot 백엔드 연결 가이드

## 1. Next.js 프로젝트 생성

```bash
# Next.js 프로젝트 생성
npx create-next-app@latest my-chat-app
cd my-chat-app

# 필요한 패키지 설치
npm install @stomp/stompjs sockjs-client
npm install --save-dev @types/sockjs-client
```

## 2. 환경 변수 설정

`.env.local` 파일 생성:

```env
# 백엔드 API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# WebSocket URL
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws

# 개발 환경 설정
NODE_ENV=development
```

## 3. API 클라이언트 설정

`lib/api.js` 파일 생성 (위의 nextjs-api-example.js 내용 사용)

## 4. Next.js 설정 파일 수정

`next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // CORS 설정 (개발 환경)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

## 5. API 라우트 예제

`pages/api/auth/login.js`:

```javascript
import { login } from '../../../lib/api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    const response = await login(email, password);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
```

## 6. 컴포넌트 예제

`components/ChatRoom.js`:

```javascript
import { useState, useEffect } from 'react';
import { getChatMessages, sendMessage } from '../lib/api';

export default function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [roomId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await getChatMessages(roomId);
      setMessages(response.data);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(roomId, newMessage);
      setNewMessage('');
      loadMessages(); // 메시지 목록 새로고침
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  return (
    <div className="chat-room">
      <div className="messages">
        {loading ? (
          <p>로딩 중...</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="message">
              <strong>{message.sender.nickname}:</strong> {message.content}
            </div>
          ))
        )}
      </div>
      
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <button type="submit">전송</button>
      </form>
    </div>
  );
}
```

## 7. 인증 처리

`contexts/AuthContext.js`:

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 페이지 로드 시 토큰 확인
    const token = localStorage.getItem('token');
    if (token) {
      // 토큰 유효성 검사 로직 추가
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/v1/users/login', {
        email,
        password,
      });
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser({ token: response.data.token });
        return response;
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

## 8. 실행 방법

1. **백엔드 실행**:
   ```bash
   cd kobweb_project
   ./gradlew bootRun
   ```

2. **Next.js 실행**:
   ```bash
   cd my-chat-app
   npm run dev
   ```

3. **접속**:
   - Next.js: http://localhost:3000
   - 백엔드 API: http://localhost:8080/api
   - Swagger UI: http://localhost:8080/swagger-ui.html

## 9. 주요 API 엔드포인트

### 인증
- `POST /api/v1/users/signup` - 회원가입
- `POST /api/v1/users/login` - 로그인

### 채팅
- `GET /api/chat/rooms` - 채팅방 목록 조회
- `GET /api/chat/rooms/{roomId}/messages` - 메시지 조회
- `POST /api/chat/rooms/{roomId}/messages` - 메시지 전송
- `POST /api/chat/rooms` - 1:1 채팅방 생성
- `POST /api/chat/rooms/group` - 그룹 채팅방 생성

### WebSocket
- `ws://localhost:8080/ws/chat` - 채팅 WebSocket 연결

## 10. 주의사항

1. **CORS 설정**: 백엔드에서 CORS가 올바르게 설정되어 있는지 확인
2. **JWT 토큰**: 모든 인증이 필요한 API 호출 시 Authorization 헤더에 Bearer 토큰 포함
3. **에러 처리**: API 호출 시 적절한 에러 처리 구현
4. **토큰 갱신**: JWT 토큰 만료 시 자동 갱신 로직 구현 고려
5. **WebSocket 연결**: 실시간 채팅을 위해 WebSocket 연결 상태 관리

## 11. 개발 도구

- **Swagger UI**: http://localhost:8080/swagger-ui.html 에서 API 문서 확인
- **브라우저 개발자 도구**: Network 탭에서 API 호출 확인
- **Postman**: API 테스트용
