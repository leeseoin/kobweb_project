'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
    general: ''
  });
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 에러 초기화
    setErrors(prev => ({ ...prev, general: '' }));

    // 비밀번호 유효성 검사
    if (name === 'password') {
      if (value.length < 8) {
        setErrors(prev => ({ ...prev, password: '비밀번호는 최소 8자 이상이어야 합니다.' }));
      } else {
        setErrors(prev => ({ ...prev, password: '' }));
      }
    }

    // 비밀번호 확인 검사
    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다.' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (formData.password.length < 8) {
      setErrors(prev => ({ ...prev, password: '비밀번호는 최소 8자 이상이어야 합니다.' }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다.' }));
      return;
    }

    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));

    try {
      const response = await apiClient.signup({
        email: formData.email,
        password: formData.password,
        nickname: formData.name
      });

      if (response.success) {
        console.log('회원가입 성공:', response);
        // 회원가입 성공 후 로그인 페이지로 리다이렉트
        router.push('/login?message=signup_success');
      } else {
        setErrors(prev => ({ ...prev, general: response.message || '회원가입에 실패했습니다.' }));
      }
    } catch (error: any) {
      console.error('회원가입 오류:', error);

      // API 클라이언트에서 이미 사용자 친화적인 메시지로 변환되므로 그대로 사용
      if (error?.response?.data?.message) {
        setErrors(prev => ({ ...prev, general: error.response.data.message }));
      } else if (error?.message) {
        setErrors(prev => ({ ...prev, general: error.message }));
      } else {
        setErrors(prev => ({ ...prev, general: '회원가입 중 문제가 발생했습니다. 다시 시도해주세요.' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Google OAuth2 회원가입으로 리다이렉트
    window.location.href = apiClient.getGoogleLoginUrl();
  };

  const handleGitHubSignUp = () => {
    // GitHub OAuth2 회원가입으로 리다이렉트
    window.location.href = apiClient.getGithubLoginUrl();
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center" style={{backgroundColor: '#F0F5F9'}}>
      <div className="max-w-md w-full space-y-8">
        <div className="rounded-2xl shadow-lg p-8" style={{backgroundColor: '#e1e4e6'}}>
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{color: '#1E2022'}}>Create Account</h2>
            <p className="text-sm" style={{color: '#52616B'}}>Join us to start managing your business cards</p>
          </div>

          {/* 에러 메시지 */}
          {errors.general && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca'}}>
              {errors.general}
            </div>
          )}

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full Name"
                required
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                style={{border: '1px solid #bfc7d1', color: '#1E2022', backgroundColor: '#F0F5F9', '--tw-ring-color': '#34373b'} as React.CSSProperties}
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                required
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                style={{border: '1px solid #bfc7d1', color: '#1E2022', backgroundColor: '#F0F5F9', '--tw-ring-color': '#34373b'} as React.CSSProperties}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password (minimum 8 characters)"
                required
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all pr-12"
                style={{border: '1px solid #bfc7d1', color: '#1E2022', backgroundColor: '#F0F5F9', '--tw-ring-color': '#34373b'} as React.CSSProperties}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70 cursor-pointer"
                style={{color: '#788189'}}
              >
                <i className={`w-5 h-5 flex items-center justify-center ${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}`}></i>
              </button>
              {errors.password && (
                <p className="text-xs mt-1" style={{color: '#dc2626'}}>{errors.password}</p>
              )}
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                required
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all pr-12"
                style={{border: '1px solid #bfc7d1', color: '#1E2022', backgroundColor: '#F0F5F9', '--tw-ring-color': '#34373b'} as React.CSSProperties}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70 cursor-pointer"
                style={{color: '#788189'}}
              >
                <i className={`w-5 h-5 flex items-center justify-center ${showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'}`}></i>
              </button>
              {errors.confirmPassword && (
                <p className="text-xs mt-1" style={{color: '#dc2626'}}>{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || errors.password !== '' || errors.confirmPassword !== ''}
              className="w-full py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap hover:opacity-90 disabled:opacity-60"
              style={{backgroundColor: '#1E2022', color: '#F0F5F9'}}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <i className="ri-loader-4-line w-5 h-5 animate-spin flex items-center justify-center"></i>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
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
                <span className="px-2" style={{backgroundColor: '#e1e4e6', color: '#52616B'}}>Or sign up with</span>
              </div>
            </div>
          </div>

          {/* 소셜 회원가입 */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg hover:opacity-90 transition-colors cursor-pointer whitespace-nowrap"
              style={{border: '1px solid #bfc7d1', backgroundColor: '#F0F5F9'}}
            >
              <i className="ri-google-fill w-5 h-5 flex items-center justify-center text-red-500 mr-3"></i>
              <span className="font-medium" style={{color: '#1E2022'}}>Sign up with Google</span>
            </button>

            <button
              onClick={handleGitHubSignUp}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap hover:opacity-90"
              style={{backgroundColor: '#34373b', color: '#F0F5F9'}}
            >
              <i className="ri-github-fill w-5 h-5 flex items-center justify-center mr-3"></i>
              <span className="font-medium">Sign up with GitHub</span>
            </button>
          </div>

          {/* 이용약관 동의 */}
          <div className="mt-6 text-center text-xs" style={{color: '#52616B'}}>
            By creating an account, you agree to our{' '}
            <a href="#" className="hover:opacity-70 cursor-pointer transition-colors" style={{color: '#1E2022'}}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="hover:opacity-70 cursor-pointer transition-colors" style={{color: '#1E2022'}}>
              Privacy Policy
            </a>
          </div>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <div className="text-sm">
              <span style={{color: '#52616B'}}>Already have an account? </span>
              <Link href="/login" className="font-medium cursor-pointer hover:opacity-80 transition-colors" style={{color: '#1E2022'}}>
                Sign in
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