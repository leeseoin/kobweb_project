
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '../../lib/api';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'signup_success') {
      setSuccessMessage('회원가입이 완료되었습니다! 이제 로그인해주세요.');
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiClient.login({
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        console.log('로그인 성공:', response);
        // 로그인 성공 후 대시보드로 리다이렉트
        router.push('/dashboard');
      } else {
        setError(response.message || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);

      // API 클라이언트에서 이미 사용자 친화적인 메시지로 변환되므로 그대로 사용
      if (error?.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error?.message) {
        setError(error.message);
      } else {
        setError('로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Google OAuth2 로그인으로 리다이렉트
    window.location.href = apiClient.getGoogleLoginUrl();
  };

  const handleGitHubSignIn = () => {
    // GitHub OAuth2 로그인으로 리다이렉트
    window.location.href = apiClient.getGithubLoginUrl();
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center" style={{backgroundColor: '#F0F5F9'}}>
      <div className="max-w-md w-full space-y-8">
        <div className="rounded-2xl shadow-lg p-8" style={{backgroundColor: '#e1e4e6'}}>
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{color: '#1E2022'}}>Sign In</h2>
            <p className="text-sm" style={{color: '#52616B'}}>Enter your credentials to access your account</p>
          </div>

          {/* 성공 메시지 */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0'}}>
              {successMessage}
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca'}}>
              {error}
            </div>
          )}

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                style={{border: '1px solid #bfc7d1', color: '#1E2022', backgroundColor: '#F0F5F9', '--tw-ring-color': '#34373b'}}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all pr-12"
                style={{border: '1px solid #bfc7d1', color: '#1E2022', backgroundColor: '#F0F5F9', '--tw-ring-color': '#34373b'}}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70 cursor-pointer"
                style={{color: '#788189'}}
              >
                <i className={`w-5 h-5 flex items-center justify-center ${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}`}></i>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap hover:opacity-90 disabled:opacity-60"
              style={{backgroundColor: '#1E2022', color: '#F0F5F9'}}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <i className="ri-loader-4-line w-5 h-5 animate-spin flex items-center justify-center"></i>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* 구분선 */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{borderColor: '#bfc7d1'}}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2" style={{backgroundColor: '#e1e4e6', color: '#52616B'}}>Or continue with</span>
              </div>
            </div>
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg hover:opacity-90 transition-colors cursor-pointer whitespace-nowrap"
              style={{border: '1px solid #bfc7d1', backgroundColor: '#F0F5F9'}}
            >
              <i className="ri-google-fill w-5 h-5 flex items-center justify-center text-red-500 mr-3"></i>
              <span className="font-medium" style={{color: '#1E2022'}}>Sign in with Google</span>
            </button>

            <button
              onClick={handleGitHubSignIn}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap hover:opacity-90"
              style={{backgroundColor: '#34373b', color: '#F0F5F9'}}
            >
              <i className="ri-github-fill w-5 h-5 flex items-center justify-center mr-3"></i>
              <span className="font-medium">Sign in with GitHub</span>
            </button>
          </div>

          {/* 추가 링크 */}
          <div className="mt-6 text-center space-y-2">
            <div className="text-sm">
              <a href="#" className="hover:opacity-70 cursor-pointer transition-colors" style={{color: '#52616B'}}>
                Forgot your password?
              </a>
            </div>
            <div className="text-sm">
              <span style={{color: '#52616B'}}>Don't have an account? </span>
              <Link href="/signup" className="font-medium cursor-pointer hover:opacity-80 transition-colors" style={{color: '#1E2022'}}>
                Sign up
              </Link>
            </div>
          </div>

          {/* 메인으로 돌아가기 */}
          <div className="mt-8 text-center">
            <Link 
              href="/"
              className="inline-flex items-center text-sm cursor-pointer hover:opacity-70 transition-colors"
              style={{color: '#52616B'}}
            >
              <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center mr-2"></i>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
