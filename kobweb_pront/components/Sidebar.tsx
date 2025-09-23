
'use client';

import { useUnreadAlarmCount } from '../hooks/useApi';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const { data: unreadCount, loading: countLoading } = useUnreadAlarmCount({ polling: true }); // 폴링 활성화
  const menuItems = [
    { id: 'contacts', label: '명함 관리', icon: 'ri-contacts-line' },
    { id: 'network', label: '명함 관계도', icon: 'ri-group-line' },
    { id: 'resume', label: '이력서 관리', icon: 'ri-file-user-line' },
    { id: 'messages', label: '메시지', icon: 'ri-chat-3-line' },
    { id: 'notifications', label: '알림', icon: 'ri-notification-3-line' },
    { id: 'settings', label: '설정', icon: 'ri-settings-3-line' }
  ];

  return (
    <div className="w-64 bg-[#C9D6DF] border-r border-[#bfc7d1] flex flex-col">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors cursor-pointer whitespace-nowrap ${
                currentView === item.id
                  ? 'bg-[#34373b] text-[#F0F5F9]'
                  : 'text-[#52616B] hover:bg-[#F0F5F9] hover:text-[#1E2022]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <i className={`${item.icon} w-5 h-5 flex items-center justify-center`}></i>
                <span>{item.label}</span>
              </div>

              {/* 알림 개수 배지 */}
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className={`min-w-[20px] h-5 px-2 rounded-full text-xs font-medium flex items-center justify-center ${
                  currentView === item.id
                    ? 'bg-red-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
