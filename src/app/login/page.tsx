
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '../lib/api';

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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-gradient-to-br from-blue-100 via-cyan-100 to-sky-100">
      <div className="max-w-md w-full space-y-8">
        <div className="rounded-2xl shadow-2xl p-8 bg-white/90 backdrop-blur-sm border-2 border-slate-400">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent font-montserrat">Sign In</h2>
            <p className="text-sm text-slate-700 font-medium">Enter your credentials to access your account</p>
          </div>

          {/* 성공 메시지 */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-green-100 text-green-800 border-2 border-green-400 font-semibold shadow-md">
              {successMessage}
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-red-100 text-red-800 border-2 border-red-400 font-semibold shadow-md">
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
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-400 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium shadow-sm"
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
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-400 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-12 font-medium shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-slate-800 cursor-pointer transition-colors"
              >
                <i className={`w-5 h-5 flex items-center justify-center ${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}`}></i>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 disabled:opacity-60 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
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
                <div className="w-full border-t-2 border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-700 font-semibold">Or continue with</span>
              </div>
            </div>
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg border-2 border-slate-400 bg-white hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              <i className="ri-google-fill w-5 h-5 flex items-center justify-center text-red-500 mr-3"></i>
              <span className="font-bold text-slate-800">Sign in with Google</span>
            </button>

            <button
              onClick={handleGitHubSignIn}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition-all cursor-pointer whitespace-nowrap shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              <i className="ri-github-fill w-5 h-5 flex items-center justify-center mr-3"></i>
              <span className="font-bold">Sign in with GitHub</span>
            </button>
          </div>

          {/* 추가 링크 */}
          <div className="mt-6 text-center space-y-2">
            <div className="text-sm">
              <a href="#" className="text-slate-700 hover:text-blue-700 cursor-pointer transition-colors font-medium">
                Forgot your password?
              </a>
            </div>
            <div className="text-sm">
              <span className="text-slate-700 font-medium">Don't have an account? </span>
              <Link href="/signup" className="font-bold text-blue-700 cursor-pointer hover:text-cyan-700 transition-colors">
                Sign up
              </Link>
            </div>
          </div>

          {/* 메인으로 돌아가기 */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm cursor-pointer text-slate-700 hover:text-blue-700 transition-colors font-medium"
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
