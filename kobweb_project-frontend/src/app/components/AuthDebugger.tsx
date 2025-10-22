'use client';

import { useState } from 'react';
import { apiClient } from '../lib/api';

export default function AuthDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkAuthStatus = async () => {
    setIsChecking(true);

    try {
      const token = localStorage.getItem('token');
      const baseURL = process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080/api'
        : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

      setDebugInfo({
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : null,
        baseURL,
        timestamp: new Date().toISOString()
      });

      // 간단한 API 테스트
      try {
        const response = await fetch(`${baseURL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        setDebugInfo(prev => ({
          ...prev,
          healthCheck: {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
          }
        }));
      } catch (healthError) {
        setDebugInfo(prev => ({
          ...prev,
          healthCheck: {
            error: healthError instanceof Error ? healthError.message : 'Unknown error'
          }
        }));
      }

    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsChecking(false);
    }
  };

  const testBusinessCardAPI = async () => {
    setIsChecking(true);

    try {
      const token = localStorage.getItem('token');
      const baseURL = process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080/api'
        : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

      const response = await fetch(`${baseURL}/v1/business-cards`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      setDebugInfo(prev => ({
        ...prev,
        businessCardAPI: {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          response: responseData
        }
      }));

    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        businessCardAPI: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium text-yellow-800 mb-3">🔧 인증 디버깅</h3>

      <div className="space-y-2 mb-4">
        <button
          onClick={checkAuthStatus}
          disabled={isChecking}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded mr-2"
        >
          {isChecking ? '확인 중...' : '인증 상태 확인'}
        </button>

        <button
          onClick={testBusinessCardAPI}
          disabled={isChecking}
          className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded"
        >
          {isChecking ? '테스트 중...' : '명함 API 테스트'}
        </button>
      </div>

      {debugInfo && (
        <div className="bg-gray-100 rounded p-3">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}