
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useChatRooms, useMessages, useSendMessage, useCreateChatRoom, useContacts } from '../hooks/useApi';
import { useChatWebSocket } from '../hooks/useWebSocket';
import WebSocketTest from './WebSocketTest';

export default function MessageView() {
  const { data: chatRooms, loading: roomsLoading, error: roomsError, refetch: refetchChatRooms } = useChatRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const { data: messages, loading: messagesLoading, refetch: refetchMessages } = useMessages(selectedRoomId || '');
  const { sendMessage, loading: sendingMessage } = useSendMessage();
  const { createDirectChatRoom, createChatRoomByBusinessCard, loading: creatingRoom } = useCreateChatRoom();
  const { data: contacts } = useContacts();
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket connection
  const webSocket = useChatWebSocket();
  const [realTimeMessages, setRealTimeMessages] = useState<any[]>([]);
  const [roomSubscriptions, setRoomSubscriptions] = useState<Map<string, any>>(new Map());
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // 첫 번째 채팅방을 기본 선택
  useEffect(() => {
    if (chatRooms && chatRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(chatRooms[0].id);
    }
  }, [chatRooms, selectedRoomId]);

  // WebSocket 연결 시 사용자 큐 구독
  useEffect(() => {
    if (webSocket.isConnected) {
      console.log('WebSocket connected, subscribing to user queue');
      webSocket.subscribeToUserQueue();
    }
  }, [webSocket.isConnected, webSocket.subscribeToUserQueue]);

  // 선택된 채팅방이 변경될 때 해당 방을 구독
  useEffect(() => {
    if (selectedRoomId && webSocket.isConnected) {
      console.log('Subscribing to room:', selectedRoomId);

      // 이전 구독 해제 및 맵에서 제거
      setRoomSubscriptions(prev => {
        const newMap = new Map();
        prev.forEach((subscription, roomId) => {
          if (roomId !== selectedRoomId) {
            console.log('Unsubscribing from room:', roomId);
            subscription.unsubscribe();
          } else {
            newMap.set(roomId, subscription);
          }
        });
        return newMap;
      });

      // 새로운 방 구독
      if (!roomSubscriptions.has(selectedRoomId)) {
        const subscription = webSocket.subscribeToRoom(selectedRoomId);
        if (subscription) {
          setRoomSubscriptions(prev => {
            const newMap = new Map(prev);
            newMap.set(selectedRoomId, subscription);
            return newMap;
          });
        }
      }

      // 채팅방 정보 요청
      webSocket.subscribeToRoomInfo(selectedRoomId);

      // 실시간 메시지 초기화 - 이전 방의 메시지 제거
      setRealTimeMessages(prev => prev.filter(msg => msg.roomId === selectedRoomId));
    }
  }, [selectedRoomId, webSocket.isConnected, webSocket.subscribeToRoom, webSocket.subscribeToRoomInfo]);

  // WebSocket으로 받은 실시간 메시지 업데이트
  useEffect(() => {
    if (webSocket.messages.length > 0 && selectedRoomId) {
      const newMessages = webSocket.messages.filter(msg =>
        msg.roomId === selectedRoomId &&
        msg.messageId // messageId가 있는 메시지만 처리
      );

      if (newMessages.length > 0) {
        console.log(`🔄 새 실시간 메시지 ${newMessages.length}개 (방: ${selectedRoomId})`);
        setRealTimeMessages(prev => {
          // 현재 방의 메시지만 유지하고 새 메시지 추가
          const currentRoomMessages = prev.filter(msg => msg.roomId === selectedRoomId);
          const uniqueMessages = newMessages.filter(newMsg =>
            !currentRoomMessages.some(prevMsg =>
              prevMsg.messageId === newMsg.messageId ||
              (prevMsg.content === newMsg.content &&
               prevMsg.sentAt === newMsg.sentAt &&
               prevMsg.sender.id === newMsg.sender.id)
            )
          );
          return [...currentRoomMessages, ...uniqueMessages];
        });
      }
    }
  }, [webSocket.messages.length, selectedRoomId]);

  // 컴포넌트 언마운트 시 모든 구독 해제
  useEffect(() => {
    return () => {
      roomSubscriptions.forEach((subscription, roomId) => {
        console.log('Cleanup: Unsubscribing from room:', roomId);
        subscription.unsubscribe();
      });
    };
  }, []);

  // WebSocket 연결 상태 로깅
  useEffect(() => {
    console.log('WebSocket 연결 상태:', webSocket.connectionStatus);
    console.log('WebSocket 연결됨:', webSocket.isConnected);
  }, [webSocket.connectionStatus, webSocket.isConnected]);

  // Fallback 데이터 (API 연결 실패 시)
  const fallbackChatRooms = [
    {
      id: '1',
      name: '김철수',
      type: 'DIRECT' as const,
      participants: [
        { id: '1', nickname: '김철수', email: 'chulsoo@example.com' }
      ],
      lastMessage: {
        id: '1',
        content: '안녕하세요! 지난번 미팅 관련해서 문의드립니다.',
        sender: { id: '1', nickname: '김철수' },
        roomId: '1',
        sentAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // 현재 사용자 ID 가져오기 (JWT 토큰에서 추출)
  const getCurrentUserId = () => {
    if (typeof window !== 'undefined') {
      // 개발 환경에서는 URL 파라미터로 사용자 강제 설정 가능
      if (process.env.NODE_ENV === 'development') {
        const urlParams = new URLSearchParams(window.location.search);
        const debugUserId = urlParams.get('userId');
        if (debugUserId) {
          console.log('🔧 디버그 모드: 강제 사용자 ID:', debugUserId);
          return debugUserId;
        }
      }

      const token = localStorage.getItem('token');
      if (token) {
        try {
          // JWT 토큰 디코딩 (간단한 방법)
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          return decoded.sub; // JWT subject가 사용자 ID
        } catch (error) {
          console.error('JWT 토큰 디코딩 실패:', error);
        }
      }
    }
    return 'me'; // fallback
  };

  const currentUserId = getCurrentUserId();

  console.log('🔍 현재 사용자 ID:', currentUserId);

  const fallbackMessages = [
    {
      id: '1',
      content: '안녕하세요! 지난번 미팅에서 말씀해주신 프로젝트에 대해서 더 자세히 알고 싶습니다.',
      sender: { id: 'other-user-1', nickname: '김철수' },
      roomId: selectedRoomId || '1',
      sentAt: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: '2',
      content: '네, 말씀해주세요.',
      sender: { id: currentUserId, nickname: 'Me' },
      roomId: selectedRoomId || '1',
      sentAt: new Date(Date.now() - 120000).toISOString()
    },
    {
      id: '3',
      content: '프로젝트 일정과 예산에 대해 궁금합니다.',
      sender: { id: 'other-user-1', nickname: '김철수' },
      roomId: selectedRoomId || '1',
      sentAt: new Date(Date.now() - 60000).toISOString()
    }
  ];

  const emojis = ['😊', '👍', '❤️', '😄', '🎉', '👏', '🔥', '💯'];

  // 기본 아바타 컴포넌트
  const DefaultAvatar = ({ name, size = 'w-12 h-12' }: { name: string; size?: string }) => {
    const colors = [
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-yellow-400 to-yellow-600',
      'bg-gradient-to-br from-red-400 to-red-600',
      'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'bg-gradient-to-br from-orange-400 to-orange-600'
    ];

    // 이름을 기반으로 색상 선택 (일관성 있게)
    const colorIndex = name.charCodeAt(0) % colors.length;
    const initial = name.charAt(0).toUpperCase();

    return (
      <div className={`${size} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
        {initial}
      </div>
    );
  };

  // 아바타 표시 컴포넌트 (이미지가 있으면 이미지, 없으면 기본 아바타)
  const Avatar = ({ src, name, size = 'w-12 h-12', className = '' }: {
    src?: string;
    name: string;
    size?: string;
    className?: string;
  }) => {
    const [imageError, setImageError] = useState(false);

    if (!src || imageError) {
      return <DefaultAvatar name={name} size={size} />;
    }

    return (
      <img
        src={src}
        alt={name}
        className={`${size} rounded-full object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    );
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedRoomId || isSendingMessage) {
      return;
    }

    setIsSendingMessage(true);

    try {
      const clientMessageId = `${Date.now()}-${Math.random()}`;
      const messageContent = messageText.trim();

      console.log('🚀 메시지 전송 시도:', {
        selectedRoomId,
        content: messageContent,
        isConnected: webSocket.isConnected,
        connectionStatus: webSocket.connectionStatus,
        roomType: selectedRoom?.type,
        roomName: selectedRoom?.name,
        participants: selectedRoom?.participants?.length
      });

      // WebSocket 연결 상태 정확히 확인
      if (webSocket.isConnected && webSocket.connectionStatus === 'connected') {
        console.log('✅ WebSocket 연결됨, 실시간 전송 시도');

        const success = webSocket.sendChatMessage(selectedRoomId, messageContent, clientMessageId);

        if (success) {
          console.log('✅ WebSocket 메시지 전송 성공');
          setMessageText('');
          setTimeout(scrollToBottom, 100);
          return;
        } else {
          console.warn('⚠️ WebSocket 메시지 전송 실패, HTTP API로 대체');
        }
      } else {
        console.log('❌ WebSocket 연결되지 않음:', {
          isConnected: webSocket.isConnected,
          status: webSocket.connectionStatus
        });

        // 연결 상태가 연결 중이면 잠시 대기
        if (webSocket.connectionStatus === 'connecting') {
          console.log('⏳ WebSocket 연결 중, 2초 대기');
          await new Promise(resolve => setTimeout(resolve, 2000));

          // 다시 확인
          if (webSocket.isConnected && webSocket.connectionStatus === 'connected') {
            const success = webSocket.sendChatMessage(selectedRoomId, messageContent, clientMessageId);
            if (success) {
              console.log('✅ 대기 후 WebSocket 메시지 전송 성공');
              setMessageText('');
              setTimeout(scrollToBottom, 100);
              return;
            }
          }
        }

        // 연결 시도
        if (webSocket.connectionStatus === 'disconnected') {
          console.log('🔄 WebSocket 재연결 시도');
          webSocket.connect();
        }
      }

      // WebSocket 실패하거나 연결되지 않은 경우 HTTP API 사용
      console.log('🌐 HTTP API로 메시지 전송:', {
        roomId: selectedRoomId,
        roomType: selectedRoom?.type,
        content: messageContent,
        apiEndpoint: `POST /chat/rooms/${selectedRoomId}/messages`
      });

      const result = await sendMessage(selectedRoomId, { content: messageContent });
      console.log('🌐 HTTP API 응답:', result);

      setMessageText('');
      refetchMessages();
      setTimeout(scrollToBottom, 100);

    } catch (error) {
      console.error('💥 메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleCreateDirectChat = async (businessCardId: string) => {
    try {
      console.log('🎯 명함 기반 채팅방 생성 시도:', businessCardId);
      const newRoom = await createChatRoomByBusinessCard(businessCardId);
      setSelectedRoomId(newRoom.id);
      setShowNewChatModal(false);
      refetchChatRooms();
      console.log('✅ 채팅방 생성 성공, 방 ID:', newRoom.id);
    } catch (error) {
      console.error('❌ 대화방 생성 실패:', error);

      // 자기 자신과의 채팅방 생성 시도인 경우 특별한 메시지 표시
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      if (errorMessage.includes('자기 자신') || errorMessage.includes('입력하신 정보가 올바르지 않습니다')) {
        alert('자기 자신과는 채팅할 수 없습니다. 다른 사용자의 명함을 선택해주세요.');
      } else {
        alert(`채팅방 생성에 실패했습니다: ${errorMessage}`);
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  // 대화방 이름을 자연스럽게 표시하는 함수
  const getDisplayName = (room: any) => {
    if (room.type === 'DIRECT') {
      // 1:1 대화방의 경우 상대방 이름만 표시
      const otherParticipant = room.participants.find((p: any) => p.id !== currentUserId);
      return otherParticipant?.nickname || room.name;
    } else {
      // 그룹 대화방의 경우 설정된 방 이름 또는 참여자 목록
      if (room.name && !room.name.includes(' & ')) {
        return room.name;
      }
      // 참여자 이름들을 자연스럽게 조합 (최대 3명까지만 표시)
      const otherParticipants = room.participants.filter((p: any) => p.id !== currentUserId);
      if (otherParticipants.length <= 3) {
        return otherParticipants.map((p: any) => p.nickname).join(', ');
      } else {
        return `${otherParticipants.slice(0, 2).map((p: any) => p.nickname).join(', ')} 외 ${otherParticipants.length - 2}명`;
      }
    }
  };

  // 자동 스크롤 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 사용할 데이터 결정
  const displayChatRooms = chatRooms || fallbackChatRooms;
  // 메시지 처리 로직을 메모화하여 성능 최적화
  const displayMessages = useMemo(() => {
    const rawMessages = messages || fallbackMessages;

    // HTTP API 메시지와 WebSocket 실시간 메시지 결합
    const allMessages = [...rawMessages, ...realTimeMessages];

    // 메시지 데이터 표준화 및 중복 제거
    const standardizedMessages = allMessages.map(message => ({
      ...message,
      id: message.id || message.messageId || `temp-${Date.now()}-${Math.random()}`,
      messageId: message.messageId || message.id
    }));

    const uniqueMessages = standardizedMessages.filter((message, index, self) => {
      const messageKey = message.id;
      return index === self.findIndex(m => m.id === messageKey);
    });

    // 메시지를 시간 순으로 정렬 (오래된 것부터)
    return uniqueMessages.sort((a, b) =>
      new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  }, [messages, fallbackMessages, realTimeMessages]);

  const selectedRoom = displayChatRooms.find(room => room.id === selectedRoomId);

  // 메시지가 변경될 때마다 자동 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  // 채팅방이 변경될 때도 자동 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [selectedRoomId]);

  return (
    <div className="flex h-full bg-[#F0F5F9] max-w-7xl mx-auto w-full">
      {/* 대화 목록 */}
      <div className="w-80 bg-white border-r border-[#E1E4E6] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[#E1E4E6] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1E2022]">메시지</h2>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 bg-[#4F80FF] text-white rounded-lg hover:bg-[#3a6bff] transition-colors"
            title="새 대화 시작"
          >
            <i className="ri-add-line w-4 h-4"></i>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {displayChatRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={`p-4 border-b border-[#F0F5F9] cursor-pointer hover:bg-[#F8F9FA] transition-colors ${
                selectedRoomId === room.id ? 'bg-[#F0F5F9]' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {room.type === 'DIRECT' ? (
                    // 1:1 대화방: 상대방 프로필 이미지
                    <Avatar
                      src={room.participants.find((p: any) => p.id !== currentUserId)?.avatar}
                      name={getDisplayName(room)}
                      size="w-12 h-12"
                    />
                  ) : (
                    // 그룹 대화방: 그룹 아이콘
                    <div className="w-12 h-12 bg-gradient-to-br from-[#4F80FF] to-[#3a6bff] rounded-full flex items-center justify-center">
                      <i className="ri-group-line w-6 h-6 text-white"></i>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-[#1E2022]">
                      {getDisplayName(room)}
                    </h3>
                    <span className="text-xs text-[#52616B]">{room.lastMessage ? formatTime(room.lastMessage.sentAt) : ''}</span>
                  </div>
                  <p className="text-xs text-[#52616B] mt-1">
                    {room.type === 'DIRECT'
                      ? room.participants.find((p: any) => p.id !== currentUserId)?.email || ''
                      : `${room.participants.length}명의 참여자`
                    }
                  </p>
                  <p className="text-sm mt-1 truncate text-[#52616B]">
                    {room.lastMessage?.content || '새 대화를 시작해보세요'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 채팅 헤더 */}
        <div className="p-4 border-b border-[#E1E4E6] bg-white">
          {selectedRoom ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {selectedRoom.type === 'DIRECT' ? (
                    <Avatar
                      src={selectedRoom.participants.find((p: any) => p.id !== currentUserId)?.avatar}
                      name={getDisplayName(selectedRoom)}
                      size="w-10 h-10"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-[#4F80FF] to-[#3a6bff] rounded-full flex items-center justify-center">
                      <i className="ri-group-line w-5 h-5 text-white"></i>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E2022]">{getDisplayName(selectedRoom)}</h3>
                  <p className="text-sm text-[#52616B]">
                    {selectedRoom.type === 'DIRECT'
                      ? selectedRoom.participants.find((p: any) => p.id !== currentUserId)?.email || ''
                      : `${selectedRoom.participants.length}명의 참여자`
                    }
                  </p>
                </div>
              </div>

              {/* WebSocket 연결 상태 표시 및 디버그 정보 */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  webSocket.connectionStatus === 'connected' ? 'bg-green-500' :
                  webSocket.connectionStatus === 'connecting' ? 'bg-yellow-500' :
                  webSocket.connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-xs text-[#52616B]">
                  {webSocket.connectionStatus === 'connected' ? '실시간' :
                   webSocket.connectionStatus === 'connecting' ? '연결 중' :
                   webSocket.connectionStatus === 'error' ? '연결 실패' : '오프라인'}
                </span>
                {process.env.NODE_ENV === 'development' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      HTTP: {(messages || fallbackMessages).length} | WS: {realTimeMessages.length} | 표시: {displayMessages.length}
                    </span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      내 ID: {currentUserId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div>
                <h3 className="font-semibold text-[#1E2022]">채팅방을 선택하세요</h3>
                <p className="text-sm text-[#52616B]">대화를 시작할 채팅방을 선택해주세요</p>
              </div>
            </div>
          )}
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4">
          {displayMessages.map((message) => {
            const isMine = message.sender.id === currentUserId;
            // 개발 모드에서만 로그 표시하고 빈도 줄이기
            if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
              console.log('📨 메시지 표시 샘플:', {
                messageId: message.id,
                senderId: message.sender.id,
                currentUserId,
                isMine,
                senderName: message.sender.nickname
              });
            }

            return (
              <div key={message.id} className={`flex mb-4 ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${isMine ? 'text-right' : 'text-left'}`}>
                  {/* 상대방 메시지일 때만 이름 표시 */}
                  {!isMine && (
                    <div className="text-xs text-[#52616B] mb-1 px-1">
                      {message.sender.nickname || '익명'}
                    </div>
                  )}

                  <div className={`px-4 py-2 rounded-lg shadow-sm ${
                    isMine
                      ? 'bg-[#4F80FF] text-white rounded-br-none ml-auto'
                      : 'bg-white border border-[#E1E4E6] text-[#1E2022] rounded-bl-none mr-auto'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center mt-1 space-x-1 ${
                      isMine ? 'justify-end text-white/70' : 'justify-start text-[#52616B]'
                    }`}>
                      <span className="text-xs">{formatTime(message.sentAt)}</span>
                      {isMine && (
                        <i className="ri-check-double-line text-xs text-white/70"></i>
                      )}
                    </div>
                  </div>

                  {/* 내 메시지일 때만 이름 표시 (오른쪽 정렬) */}
                  {isMine && (
                    <div className="text-xs text-[#52616B] mt-1 px-1">
                      나
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {/* 자동 스크롤을 위한 ref 요소 */}
          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력 영역 */}
        <div className="p-4 border-t border-[#E1E4E6] bg-white">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-[#52616B] hover:text-[#1E2022] hover:bg-[#F0F5F9] rounded-lg transition-colors cursor-pointer">
              <i className="ri-attachment-2 w-5 h-5 flex items-center justify-center"></i>
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="메시지를 입력하세요..."
                className="w-full px-4 py-3 border border-[#E1E4E6] rounded-lg focus:outline-none focus:border-[#4F80FF] text-sm"
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-[#52616B] hover:text-[#1E2022] hover:bg-[#F0F5F9] rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-emotion-line w-5 h-5 flex items-center justify-center"></i>
              </button>
              
              {showEmojiPicker && (
                <div className="absolute bottom-12 right-0 bg-white border border-[#E1E4E6] rounded-lg shadow-lg p-3 grid grid-cols-4 gap-2">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiClick(emoji)}
                      className="p-2 hover:bg-[#F0F5F9] rounded-lg transition-colors cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={isSendingMessage || !messageText.trim()}
              className={`p-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                isSendingMessage || !messageText.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#4F80FF] text-white hover:bg-[#3a6bff]'
              }`}
            >
              {isSendingMessage ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <i className="ri-send-plane-line w-5 h-5 flex items-center justify-center"></i>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 새 대화방 생성 모달 */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1E2022]">새 대화 시작</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 text-[#52616B] hover:text-[#1E2022] rounded"
              >
                <i className="ri-close-line w-5 h-5"></i>
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-[#52616B] mb-4">대화를 시작할 연락처를 선택하세요</p>

              {contacts && contacts.length > 0 ? (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleCreateDirectChat(contact.businessCardId || contact.id)}
                    className="flex items-center space-x-3 p-3 border border-[#E1E4E6] rounded-lg cursor-pointer hover:bg-[#F8F9FA] transition-colors"
                  >
                    <Avatar
                      src={contact.avatar}
                      name={contact.name}
                      size="w-10 h-10"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-[#1E2022]">{contact.name}</h4>
                      <p className="text-sm text-[#52616B]">{contact.title}</p>
                      <p className="text-xs text-[#52616B]">{contact.email}</p>
                    </div>
                    {creatingRoom && (
                      <div className="w-4 h-4 border-2 border-[#4F80FF] border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#F0F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-contacts-line w-8 h-8 text-[#52616B]"></i>
                  </div>
                  <p className="text-[#52616B] text-sm">등록된 연락처가 없습니다</p>
                  <p className="text-[#52616B] text-xs mt-1">먼저 명함을 추가해주세요</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
