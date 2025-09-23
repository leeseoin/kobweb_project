
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api';

interface User {
  id: string;
  email: string;
  nickname: string;
}

export default function Header() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (apiClient.isLoggedIn()) {
        const response = await apiClient.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
          setIsLoggedIn(true);
        }
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      setIsLoggedIn(false);
      setShowProfileDropdown(false);
      // 메인 페이지로 리다이렉트
      router.push('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleProfileSettings = () => {
    setShowProfileDropdown(false);
    // 대시보드의 설정 뷰로 이동
    router.push('/dashboard?view=settings');
  };

  if (!mounted) {
    return (
      <header className="bg-[#1E2022] border-b border-[#bfc7d1] px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 cursor-pointer transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="ri-global-line w-5 h-5 text-white flex items-center justify-center"></i>
            </div>
            <span className="text-xl font-bold text-[#F0F5F9]">kobweb</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center space-x-2 text-[#C9D6DF] hover:text-[#e1e4e6] cursor-pointer">
              <i className="ri-contacts-book-line w-5 h-5 flex items-center justify-center"></i>
              <span>명함 관리</span>
            </Link>
            <Link href="/resume-hub" className="flex items-center space-x-2 text-[#C9D6DF] hover:text-[#e1e4e6] cursor-pointer">
              <i className="ri-briefcase-4-line w-5 h-5 flex items-center justify-center"></i>
              <span>헤드 헌터</span>
            </Link>

            <div className="relative">
              <button className="flex items-center space-x-2 text-[#C9D6DF] hover:text-[#e1e4e6] cursor-pointer">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <i className="ri-user-line w-4 h-4 flex items-center justify-center text-white"></i>
                </div>
                <span>{user?.nickname || '게스트'}</span>
                <i className="ri-arrow-down-s-line w-4 h-4 flex items-center justify-center"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-[#1E2022] border-b border-[#bfc7d1] px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 cursor-pointer transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <i className="ri-global-line w-5 h-5 text-white flex items-center justify-center"></i>
          </div>
          <span className="text-xl font-bold text-[#F0F5F9]">kobweb</span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-2 text-[#C9D6DF] hover:text-[#e1e4e6] cursor-pointer">
            <i className="ri-contacts-book-line w-5 h-5 flex items-center justify-center"></i>
            <span>명함 관리</span>
          </Link>
          <Link href="/resume-hub" className="flex items-center space-x-2 text-[#C9D6DF] hover:text-[#e1e4e6] cursor-pointer">
            <i className="ri-briefcase-4-line w-5 h-5 flex items-center justify-center"></i>
            <span>헤드 헌터</span>
          </Link>

          <div className="relative">
            {isLoggedIn && user ? (
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 text-[#C9D6DF] hover:text-[#e1e4e6] cursor-pointer"
              >
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <i className="ri-user-line w-4 h-4 flex items-center justify-center text-white"></i>
                </div>
                <span>{user.nickname}</span>
                <i className="ri-arrow-down-s-line w-4 h-4 flex items-center justify-center"></i>
              </button>
            ) : (
              <Link href="/login" className="flex items-center space-x-2 text-[#C9D6DF] hover:text-[#e1e4e6] cursor-pointer">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <i className="ri-user-line w-4 h-4 flex items-center justify-center text-white"></i>
                </div>
                <span>로그인</span>
              </Link>
            )}

            {showProfileDropdown && isLoggedIn && user && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">{user?.nickname || '게스트'}</div>
                  <div className="text-xs text-gray-500">{user?.email || 'guest@example.com'}</div>
                </div>
                
                <button
                  onClick={handleProfileSettings}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <i className="ri-user-line w-4 h-4 flex items-center justify-center text-gray-400"></i>
                  <span>프로필 설정</span>
                </button>
                
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <i className="ri-logout-box-line w-4 h-4 flex items-center justify-center text-gray-400"></i>
                    <span>로그아웃</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
