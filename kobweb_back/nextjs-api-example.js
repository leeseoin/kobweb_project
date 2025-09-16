// Next.js에서 백엔드 API 호출 예제

// 1. API 클라이언트 설정 (lib/api.js)
const API_BASE_URL = 'http://localhost:8080/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // JWT 토큰을 localStorage에서 가져오기
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // 기본 헤더 설정
  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // GET 요청
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  // POST 요청
  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  // PUT 요청
  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  // DELETE 요청
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();

// 2. 사용 예제 (pages/api 또는 components에서)

// 로그인
export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/v1/users/login', {
      email,
      password,
    });
    
    // 토큰을 localStorage에 저장
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// 회원가입
export const signup = async (userData) => {
  try {
    const response = await apiClient.post('/v1/users/signup', userData);
    return response;
  } catch (error) {
    console.error('Signup failed:', error);
    throw error;
  }
};

// 채팅방 목록 조회
export const getChatRooms = async (page = 0, size = 10) => {
  try {
    const response = await apiClient.get(`/chat/rooms?page=${page}&size=${size}`);
    return response;
  } catch (error) {
    console.error('Get chat rooms failed:', error);
    throw error;
  }
};

// 채팅방 메시지 조회
export const getChatMessages = async (roomId, lastMessageId = null, size = 30) => {
  try {
    let endpoint = `/chat/rooms/${roomId}/messages?size=${size}`;
    if (lastMessageId) {
      endpoint += `&lastMessageId=${lastMessageId}`;
    }
    const response = await apiClient.get(endpoint);
    return response;
  } catch (error) {
    console.error('Get chat messages failed:', error);
    throw error;
  }
};

// 메시지 전송
export const sendMessage = async (roomId, content) => {
  try {
    const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, {
      content,
    });
    return response;
  } catch (error) {
    console.error('Send message failed:', error);
    throw error;
  }
};

// 1:1 채팅방 생성
export const createChatRoom = async (participantId) => {
  try {
    const response = await apiClient.post(`/chat/rooms?participantId=${participantId}`);
    return response;
  } catch (error) {
    console.error('Create chat room failed:', error);
    throw error;
  }
};

// 그룹 채팅방 생성
export const createGroupChatRoom = async (roomName, userIds) => {
  try {
    const response = await apiClient.post('/chat/rooms/group', {
      userIds,
    }, {
      params: { roomName }
    });
    return response;
  } catch (error) {
    console.error('Create group chat room failed:', error);
    throw error;
  }
};

// 3. React 컴포넌트에서 사용 예제

/*
import { useState, useEffect } from 'react';
import { apiClient, login, getChatRooms, sendMessage } from '../lib/api';

export default function ChatPage() {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 채팅방 목록 로드
  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const response = await getChatRooms();
      setChatRooms(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatRooms();
  }, []);

  // 로그인 처리
  const handleLogin = async (email, password) => {
    try {
      const response = await login(email, password);
      console.log('Login successful:', response);
      // 로그인 성공 후 채팅방 목록 다시 로드
      loadChatRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>채팅</h1>
      {loading && <p>로딩 중...</p>}
      {error && <p>에러: {error}</p>}
      <div>
        {chatRooms.map(room => (
          <div key={room.id}>
            <h3>{room.name}</h3>
            <p>참여자: {room.participants.length}명</p>
          </div>
        ))}
      </div>
    </div>
  );
}
*/

// 4. WebSocket 연결 예제 (채팅 실시간 통신)

/*
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
  }

  connect(token) {
    const socket = new SockJS('http://localhost:8080/ws/chat');
    this.stompClient = Stomp.over(socket);
    
    this.stompClient.connect(
      {
        Authorization: `Bearer ${token}`,
      },
      () => {
        console.log('WebSocket 연결 성공');
        this.connected = true;
      },
      (error) => {
        console.error('WebSocket 연결 실패:', error);
        this.connected = false;
      }
    );
  }

  // 채팅방 구독
  subscribeToRoom(roomId, callback) {
    if (this.stompClient && this.connected) {
      this.stompClient.subscribe(`/topic/chat.${roomId}`, callback);
    }
  }

  // 메시지 전송
  sendMessage(roomId, content) {
    if (this.stompClient && this.connected) {
      this.stompClient.send(`/app/chat.sendMessage`, {}, JSON.stringify({
        roomId,
        content,
      }));
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.connected = false;
    }
  }
}

export const webSocketService = new WebSocketService();
*/
