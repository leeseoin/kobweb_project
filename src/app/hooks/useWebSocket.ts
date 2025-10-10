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
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
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

    const destination = `/topic/chat/${roomId}`;
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
  }, [webSocket.isConnected, webSocket.subscribe]);

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