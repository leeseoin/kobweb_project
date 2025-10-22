'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '../../lib/api';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // URL에서 에러 확인
        const error = searchParams.get('error');
        const errorMessage = searchParams.get('message');

        if (error === 'true') {
          throw new Error(errorMessage || 'OAuth 인증에 실패했습니다.');
        }

        // URL에서 토큰 정보 추출
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh');
        const provider = searchParams.get('provider');

        if (!token) {
          throw new Error('인증 토큰이 없습니다.');
        }

        // API 클라이언트를 통해 토큰 저장
        apiClient.saveOAuthTokens(token, refreshToken || undefined);

        setStatus('success');
        setMessage(`${provider} 로그인이 성공했습니다. 잠시 후 대시보드로 이동합니다.`);

        // 2초 후 대시보드로 리다이렉트
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        setStatus('error');
        setMessage('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');

        // 3초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#F0F5F9'}}>
      <div className="max-w-md w-full p-8 rounded-2xl shadow-lg text-center" style={{backgroundColor: '#e1e4e6'}}>
        {status === 'loading' && (
          <>
            <div className="mb-4">
              <i className="ri-loader-4-line text-4xl animate-spin" style={{color: '#1E2022'}}></i>
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{color: '#1E2022'}}>
              로그인 처리 중
            </h2>
            <p className="text-sm" style={{color: '#52616B'}}>
              잠시만 기다려주세요...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4">
              <i className="ri-check-circle-fill text-4xl text-green-500"></i>
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{color: '#1E2022'}}>
              로그인 성공
            </h2>
            <p className="text-sm" style={{color: '#52616B'}}>
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-4">
              <i className="ri-error-warning-fill text-4xl text-red-500"></i>
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{color: '#1E2022'}}>
              로그인 실패
            </h2>
            <p className="text-sm mb-4" style={{color: '#52616B'}}>
              {message}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{backgroundColor: '#1E2022', color: '#F0F5F9'}}
            >
              로그인 페이지로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}