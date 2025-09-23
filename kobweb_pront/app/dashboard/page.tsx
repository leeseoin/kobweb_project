
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import ContactManager from '../../components/ContactManager';
import NetworkView from '../../components/NetworkView';
import MessageView from '../../components/MessageView';
import NotificationView from '../../components/NotificationView';
import ResumeView from '../../components/ResumeView';
import SettingsView from '../../components/SettingsView';
import BusinessCardEditor from '../../components/BusinessCardEditor';
import Sidebar from '../../components/Sidebar';

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState('contacts');
  const [showAIChat, setShowAIChat] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const view = searchParams.get('view');
    if (view) {
      setCurrentView(view);
    }
  }, [searchParams]);

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

      {/* AI Chat Button - Responsive positioning */}
      <button
        onClick={() => setShowAIChat(!showAIChat)}
        className="fixed bottom-20 lg:bottom-6 left-4 lg:left-6 w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-[#1E2022] to-[#34373b] text-[#F0F5F9] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
        title="AI 채팅"
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
        <div className="fixed bottom-32 lg:bottom-24 left-4 lg:left-6 w-[calc(100vw-2rem)] max-w-sm lg:w-80 h-80 lg:h-96 bg-white border border-[#bfc7d1] rounded-lg lg:rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden">
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
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#1E2022] to-[#34373b] rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-robot-line text-[#F0F5F9] text-sm"></i>
                </div>
                <div className="bg-white border border-[#bfc7d1] rounded-lg p-3 max-w-xs">
                  <p className="text-[#1E2022] text-sm">
                    안녕하세요! 네트워크 관리와 명함 정리에 도움이 필요하시면 언제든지 말씀해 주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-[#bfc7d1] bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="메시지를 입력하세요..."
                className="flex-1 border border-[#bfc7d1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#34373b] text-[#1E2022]"
              />
              <button className="bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg transition-colors text-sm">
                <i className="ri-send-plane-line"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
