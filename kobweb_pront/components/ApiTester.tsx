'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface ConnectionStatus {
  isConnected: boolean;
  latency?: number;
  error?: string;
}

export default function ApiTester() {
  const [status, setStatus] = useState<ConnectionStatus>({ isConnected: false });
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.checkConnection();
      setStatus(result);

      const message = result.isConnected
        ? `✅ 연결 성공 (응답시간: ${result.latency}ms)`
        : `❌ 연결 실패: ${result.error}`;

      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    } catch (error) {
      setStatus({ isConnected: false, error: 'Unknown error' });
      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ❌ 연결 오류`]);
    } finally {
      setIsLoading(false);
    }
  };

  const testSignup = async () => {
    setIsLoading(true);
    try {
      const testUser = {
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        nickname: `TestUser${Date.now()}`
      };

      const result = await apiClient.signup(testUser);
      const message = result.success
        ? '✅ 회원가입 테스트 성공'
        : `❌ 회원가입 테스트 실패: ${result.message}`;

      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    } catch (error) {
      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ❌ 회원가입 테스트 오류: ${error}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const testOAuth = async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.getOAuthStatus();
      const message = result.success
        ? `✅ OAuth 설정 확인: ${result.data.providers.join(', ')} 지원`
        : `❌ OAuth 설정 오류: ${result.message}`;

      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    } catch (error) {
      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ❌ OAuth 테스트 오류: ${error}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const testCurrentUser = async () => {
    setIsLoading(true);
    try {
      if (!apiClient.isLoggedIn()) {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ⚠️ 로그인이 필요합니다`]);
        return;
      }

      const result = await apiClient.getCurrentUser();
      const message = result.success
        ? `✅ 현재 사용자: ${result.data.email} (${result.data.provider})`
        : `❌ 사용자 정보 조회 실패: ${result.message}`;

      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    } catch (error) {
      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ❌ 사용자 정보 조회 오류: ${error}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">API 연동 테스트</h2>

      {/* 연결 상태 */}
      <div className="mb-6 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">연결 상태</h3>
        <div className={`flex items-center space-x-2 ${status.isConnected ? 'text-green-600' : 'text-red-600'}`}>
          <div className={`w-3 h-3 rounded-full ${status.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>
            {status.isConnected
              ? `연결됨 (${status.latency}ms)`
              : `연결 실패: ${status.error}`
            }
          </span>
        </div>
      </div>

      {/* 테스트 버튼들 */}
      <div className="mb-6 space-x-4">
        <button
          onClick={checkConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '테스트 중...' : '연결 테스트'}
        </button>

        <button
          onClick={testSignup}
          disabled={isLoading || !status.isConnected}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          회원가입 테스트
        </button>

        <button
          onClick={testOAuth}
          disabled={isLoading || !status.isConnected}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          OAuth 설정 확인
        </button>

        <button
          onClick={testCurrentUser}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
        >
          현재 사용자 확인
        </button>

        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          결과 초기화
        </button>
      </div>

      {/* 테스트 결과 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">테스트 결과</h3>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {testResults.length === 0 ? (
            <p className="text-gray-500">테스트 결과가 없습니다.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-white p-2 rounded">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* API 설정 정보 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">API 설정</h3>
        <div className="text-sm space-y-1">
          <p><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'}</p>
          <p><strong>Timeout:</strong> {process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'}ms</p>
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
        </div>
      </div>
    </div>
  );
}