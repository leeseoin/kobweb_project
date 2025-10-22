'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useChatWebSocket } from '../hooks/useWebSocket';
import type { ChatMessageData } from '../hooks/useWebSocket';

// WebSocket Context 타입 정의
interface WebSocketContextType {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  connect: () => void;
  disconnect: () => void;
  sendMessage: (destination: string, body: any, headers?: Record<string, string>) => boolean;
  subscribe: (destination: string, callback: (message: any) => void) => any;
  unsubscribe: (destination: string) => void;
  subscriptions: string[];
  messages: ChatMessageData[];
  rooms: any[];
  subscribeToRoom: (roomId: string) => any;
  subscribeToUserQueue: () => any;
  sendChatMessage: (roomId: string, content: string, clientMessageId?: string) => boolean;
  createRoom: (roomName: string, participantIds: string[]) => boolean;
  subscribeToRoomInfo: (roomId: string) => boolean;
  clearMessages: () => void;
}

// Context 생성
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Provider 컴포넌트
export function WebSocketProvider({ children }: { children: ReactNode }) {
  // useChatWebSocket 훅을 한 번만 호출하여 싱글톤 인스턴스 생성
  const webSocket = useChatWebSocket();

  console.log('🔌 WebSocketProvider mounted - 싱글톤 WebSocket 연결 생성');

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom hook to use WebSocket context
export function useWebSocketContext(): WebSocketContextType {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}
