import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface WebSocketMessage {
  type: string;
  messageId: string;
  timestamp: number;
  payload: any;
}

export interface ChatMessageData {
  messageId: string;
  roomId: string;
  content: string;
  sender: {
    id: string;
    nickname: string;
  };
  sentAt: string;
  sequence: number;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const clientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [subscriptions, setSubscriptions] = useState<Set<string>>(new Set());

  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }, []);

  // WebSocket 인증 실패 처리 (강제 로그아웃)
  const handleWebSocketAuthError = useCallback(() => {
    console.log('🔒 WebSocket 인증 실패 - 세션 만료 처리');

    // 재연결 시도 중단
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // WebSocket 연결 종료
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    // 토큰 제거
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      // 세션 만료 알림 표시
      alert('⚠️ 세션이 만료되었습니다.\n\n보안을 위해 자동으로 로그아웃됩니다.\n다시 로그인해주세요.');

      // 로그인 페이지로 리다이렉트
      setTimeout(() => {
        window.location.href = '/login?reason=session_expired';
      }, 1000);
    }
  }, []);

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) {
      console.warn('No token found, cannot connect to WebSocket');
      setConnectionStatus('error');
      return;
    }

    if (clientRef.current && clientRef.current.connected) {
      console.log('WebSocket already connected');
      return;
    }

    setConnectionStatus('connecting');

    // SockJS URL with token (HTTP/HTTPS for SockJS)
    const sockjsUrl = process.env.NODE_ENV === 'development'
      ? `http://localhost:8080/ws/chat?token=${encodeURIComponent(token)}`
      : `https://${window.location.host}/ws/chat?token=${encodeURIComponent(token)}`;

    console.log('Connecting to SockJS:', sockjsUrl);

    const client = new Client({
      webSocketFactory: () => new SockJS(sockjsUrl),
      connectHeaders: {},
      debug: (str) => {
        console.log('[STOMP Debug]', str);
      },
      reconnectDelay: 0, // STOMP 자동 재연결 비활성화 (우리의 재연결 로직 사용)
      heartbeatIncoming: 10000, // 서버로부터 하트비트 수신 대기 시간 (10초)
      heartbeatOutgoing: 10000, // 클라이언트가 서버로 하트비트 전송 간격 (10초)
      onConnect: (frame) => {
        console.log('WebSocket connected:', frame);
        setIsConnected(true);
        setConnectionStatus('connected');
        options.onConnect?.();
      },
      onDisconnect: (frame) => {
        console.log('WebSocket disconnected:', frame);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        options.onDisconnect?.();
      },
      onStompError: (frame) => {
        console.error('WebSocket STOMP error:', frame);
        console.error('Error message:', frame.headers.message);
        console.error('Error body:', frame.body);

        // JWT 인증 실패 감지 (토큰 만료 또는 유효하지 않은 토큰)
        const errorMessage = frame.headers.message || frame.body || '';
        if (errorMessage.includes('인증 실패') ||
            errorMessage.includes('JWT') ||
            errorMessage.includes('토큰') ||
            errorMessage.includes('Authentication')) {
          console.error('🚨 WebSocket 인증 실패 - 세션 만료 처리');
          handleWebSocketAuthError();
        }

        setConnectionStatus('error');
        options.onError?.(frame);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        options.onError?.(error);
      },
    });

    clientRef.current = client;
    client.activate();
  }, [getToken, options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    setSubscriptions(new Set());
  }, []);

  const sendMessage = useCallback((destination: string, body: any, headers: Record<string, string> = {}) => {
    console.log('📤 WebSocket 메시지 전송 시도:', { destination, connected: clientRef.current?.connected, connectionStatus });

    if (!clientRef.current) {
      console.error('❌ WebSocket 클라이언트가 초기화되지 않음');
      return false;
    }

    if (!clientRef.current.connected) {
      console.error('❌ WebSocket 연결되지 않음 - 메시지 전송 불가');
      return false;
    }

    if (connectionStatus !== 'connected') {
      console.error('❌ WebSocket 상태가 연결됨이 아님:', connectionStatus);
      return false;
    }

    try {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
        headers
      });
      console.log('✅ WebSocket 메시지 전송 성공:', { destination, body });
      return true;
    } catch (error) {
      console.error('💥 WebSocket 메시지 전송 실패:', error);
      return false;
    }
  }, [connectionStatus]);

  const subscribe = useCallback((destination: string, callback: (message: any) => void) => {
    console.log('🔔 구독 시도:', destination);

    if (!clientRef.current || !clientRef.current.connected) {
      console.warn('WebSocket not connected, cannot subscribe to:', destination);
      return null;
    }

    try {
      const subscription = clientRef.current.subscribe(destination, (message) => {
        try {
          const parsedBody = JSON.parse(message.body);
          console.log('Received message from', destination, ':', parsedBody);
          callback(parsedBody);
        } catch (error) {
          console.error('Failed to parse message:', error);
          callback(message.body);
        }
      });

      setSubscriptions(prev => new Set(prev).add(destination));
      console.log('✅ 구독 성공:', destination);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to', destination, ':', error);
      return null;
    }
  }, []);

  const unsubscribe = useCallback((destination: string) => {
    setSubscriptions(prev => {
      const newSet = new Set(prev);
      newSet.delete(destination);
      return newSet;
    });
  }, []);

  // Auto-connect when token is available
  useEffect(() => {
    const token = getToken();
    if (token && !isConnected && connectionStatus !== 'connecting') {
      console.log('토큰이 있고 연결되지 않음, 자동 연결 시도');
      connect();
    }
  }, [getToken, isConnected, connectionStatus, connect]);

  // Auto-reconnect when disconnected
  useEffect(() => {
    if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
      const token = getToken();
      if (token && !reconnectTimeoutRef.current) {
        console.log('🔄 연결 끊어짐, 3초 후 재연결 시도');
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          console.log('🔄 WebSocket 재연결 실행');
          connect();
        }, 3000); // 5초에서 3초로 단축
      }
    }

    // 연결되면 재연결 타이머 클리어
    if (connectionStatus === 'connected' && reconnectTimeoutRef.current) {
      console.log('✅ 연결 성공, 재연결 타이머 클리어');
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, [connectionStatus, getToken, connect]);

  // Debug helper - expose WebSocket state to browser console
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).webSocketDebug = {
        connectionStatus,
        isConnected,
        subscriptions: Array.from(subscriptions),
        clientConnected: clientRef.current?.connected || false
      };
    }
  }, [connectionStatus, isConnected, subscriptions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    subscriptions: Array.from(subscriptions)
  };
}

// Chat-specific hooks
export function useChatWebSocket() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  const webSocket = useWebSocket({
    onConnect: () => {
      console.log('Chat WebSocket connected');
    },
    onDisconnect: () => {
      console.log('Chat WebSocket disconnected');
    },
    onError: (error) => {
      console.error('Chat WebSocket error:', error);
    }
  });

  const subscribeToRoom = useCallback((roomId: string) => {
    if (!webSocket.isConnected) {
      console.warn('WebSocket not connected, cannot subscribe to room:', roomId);
      return null;
    }

    // 백엔드에 채팅방 구독 요청 (안 읽은 카운트 초기화)
    const subscribeRequestData = { roomId };
    webSocket.sendMessage('/app/subscribe', subscribeRequestData);
    console.log('📩 채팅방 구독 요청 전송 (안 읽은 카운트 초기화):', roomId);

    // 채팅방 토픽 구독
    const destination = `/topic/room.${roomId}`;
    return webSocket.subscribe(destination, (message: WebSocketMessage) => {
      if (message.type === 'chat.message') {
        const chatMessage = message.payload as ChatMessageData;
        setMessages(prev => {
          // 중복 메시지 방지
          const isDuplicate = prev.some(msg =>
            msg.messageId === chatMessage.messageId ||
            (msg.content === chatMessage.content &&
             msg.sentAt === chatMessage.sentAt &&
             msg.sender.id === chatMessage.sender.id)
          );
          return isDuplicate ? prev : [...prev, chatMessage];
        });
      }
    });
  }, [webSocket.isConnected, webSocket.subscribe, webSocket.sendMessage]);

  const subscribeToUserQueue = useCallback(() => {
    if (!webSocket.isConnected) {
      console.warn('WebSocket not connected, cannot subscribe to user queue');
      return null;
    }

    return webSocket.subscribe('/user/queue/rooms', (message: WebSocketMessage) => {
      console.log('Received room update:', message);
      // Handle room-related messages (invitations, etc.)
    });
  }, [webSocket.isConnected, webSocket.subscribe]);

  const sendChatMessage = useCallback((roomId: string, content: string, clientMessageId?: string) => {
    const messageData = {
      roomId,
      content,
      clientMessageId: clientMessageId || `${Date.now()}-${Math.random()}`
    };

    return webSocket.sendMessage('/app/send-message', messageData);
  }, [webSocket.sendMessage]);

  const createRoom = useCallback((roomName: string, participantIds: string[]) => {
    const requestData = {
      roomName,
      participantIds
    };

    return webSocket.sendMessage('/app/create-room', requestData);
  }, [webSocket.sendMessage]);

  const subscribeToRoomInfo = useCallback((roomId: string) => {
    const requestData = { roomId };
    return webSocket.sendMessage('/app/room-info', requestData);
  }, [webSocket.sendMessage]);

  return {
    ...webSocket,
    messages,
    rooms,
    subscribeToRoom,
    subscribeToUserQueue,
    sendChatMessage,
    createRoom,
    subscribeToRoomInfo,
    clearMessages: () => setMessages([])
  };
}