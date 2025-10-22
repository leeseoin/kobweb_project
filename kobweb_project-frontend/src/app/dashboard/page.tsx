
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import ContactManager from '../components/ContactManager';
import NetworkView from '../components/NetworkView';
import MessageView from '../components/MessageView';
import NotificationView from '../components/NotificationView';
import ResumeView from '../components/ResumeView';
import SettingsView from '../components/SettingsView';
import BusinessCardEditor from '../components/BusinessCardEditor';
import Sidebar from '../components/Sidebar';
import { apiClient } from '../lib/api';

interface AIMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState('contacts');
  const [showAIChat, setShowAIChat] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 24, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      role: 'ai',
      content: '안녕하세요! 네트워크 관리와 명함 정리에 도움이 필요하시면 언제든지 말씀해 주세요.',
      timestamp: new Date()
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const searchParams = useSearchParams();

  // 초기 위치 설정 (저장된 위치 불러오기)
  useEffect(() => {
    const savedPosition = localStorage.getItem('aiButtonPosition');
    if (savedPosition) {
      setButtonPosition(JSON.parse(savedPosition));
    } else {
      setButtonPosition({ x: 24, y: window.innerHeight - 120 });
    }
  }, []);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view) {
      setCurrentView(view);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setHasMoved(true);
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        };
        setButtonPosition(newPosition);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        setHasMoved(true);
        const touch = e.touches[0];
        const newPosition = {
          x: touch.clientX - dragOffset.x,
          y: touch.clientY - dragOffset.y
        };
        setButtonPosition(newPosition);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        // 위치를 localStorage에 저장
        localStorage.setItem('aiButtonPosition', JSON.stringify(buttonPosition));
      }
      setIsDragging(false);
      setTimeout(() => setHasMoved(false), 100);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragOffset, buttonPosition]);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleAISendMessage = async () => {
    if (!aiInput.trim() || aiLoading) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: aiInput,
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiLoading(true);

    try {
      const response = await apiClient.sendAIMessage(aiInput);

      const aiMessage: AIMessage = {
        role: 'ai',
        content: response.response,
        timestamp: new Date()
      };

      setAiMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI 메시지 전송 실패:', error);

      const errorMessage: AIMessage = {
        role: 'ai',
        content: '죄송합니다. AI 서버에 연결할 수 없습니다. 나중에 다시 시도해주세요.',
        timestamp: new Date()
      };

      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'contacts':
        return <ContactManager />;
      case 'network':
        return <NetworkView />;
      case 'messages':
        return <MessageView />;
      case 'notifications':
        return <NotificationView />;
      case 'resume':
        return <ResumeView />;
      case 'settings':
        return <SettingsView />;
      case 'card-editor':
        return <BusinessCardEditor />;
      default:
        return <ContactManager />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F5F9] relative">
      <Header />

      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

        <main className="flex-1 p-6 overflow-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* AI Chat Button - Draggable */}
      <button
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={(e) => {
          if (!hasMoved) {
            setShowAIChat(!showAIChat);
          }
        }}
        style={{
          left: `${buttonPosition.x}px`,
          top: `${buttonPosition.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none'
        }}
        className="fixed w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-[#1E2022] to-[#34373b] text-[#F0F5F9] rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 flex items-center justify-center group"
        title="AI 채팅 (드래그 가능)"
      >
        <div className="relative">
          <i className="ri-robot-line text-lg lg:text-xl"></i>
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>

        {/* Tooltip - Desktop only */}
        <div className="hidden lg:block absolute bottom-full left-0 mb-2 px-3 py-1 bg-[#1E2022] text-[#F0F5F9] text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          AI 어시스턴트
          <div className="absolute top-full left-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1E2022]"></div>
        </div>
      </button>

      {/* AI Chat Panel - Responsive sizing */}
      {showAIChat && (
        <div
          style={{
            left: `${buttonPosition.x}px`,
            top: `${Math.max(10, buttonPosition.y - 400)}px`
          }}
          className="fixed w-[calc(100vw-2rem)] max-w-sm lg:w-80 h-80 lg:h-96 bg-white border border-[#bfc7d1] rounded-lg lg:rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#1E2022] to-[#34373b] text-[#F0F5F9] p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="ri-robot-line text-lg"></i>
              <span className="font-semibold">AI 어시스턴트</span>
            </div>
            <button
              onClick={() => setShowAIChat(false)}
              className="hover:bg-white/20 rounded p-1 transition-colors"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#F0F5F9]">
            <div className="space-y-4">
              {aiMessages.map((message, index) => (
                <div key={index} className={`flex items-start space-x-2 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {message.role === 'ai' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-[#1E2022] to-[#34373b] rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-robot-line text-[#F0F5F9] text-sm"></i>
                    </div>
                  )}
                  <div className={`rounded-lg p-3 max-w-xs ${
                    message.role === 'ai'
                      ? 'bg-white border border-[#bfc7d1]'
                      : 'bg-[#34373b] text-white'
                  }`}>
                    <p className={`text-sm ${message.role === 'ai' ? 'text-[#1E2022]' : 'text-white'}`}>
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#1E2022] to-[#34373b] rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-robot-line text-[#F0F5F9] text-sm"></i>
                  </div>
                  <div className="bg-white border border-[#bfc7d1] rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#52616B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#52616B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#52616B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-[#bfc7d1] bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAISendMessage();
                  }
                }}
                placeholder="메시지를 입력하세요..."
                disabled={aiLoading}
                className="flex-1 border border-[#bfc7d1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#34373b] text-[#1E2022] disabled:bg-gray-100"
              />
              <button
                onClick={handleAISendMessage}
                disabled={aiLoading || !aiInput.trim()}
                className="bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="ri-send-plane-line"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
