
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

interface User {
  id: string;
  email: string;
  nickname: string;
}

export default function SettingsView() {
  const [activeCategory, setActiveCategory] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [profileImage, setProfileImage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    githubUsername: '',
    portfolioUrl: '',
    location: '',
    github: '',
    notion: '',
    skills: [] as string[],
    notifications: {
      newConnection: { inApp: true, email: true },
      newMessage: { inApp: true, email: false },
      networkActivity: { inApp: true, email: false },
      serviceAnnouncement: { inApp: true, email: true }
    },
    privacy: {
      profileVisibility: 'public',
      connectionRequests: 'everyone'
    }
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      if (apiClient.isLoggedIn()) {
        const response = await apiClient.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
          // 실제 사용자 정보로 폼 데이터 초기화
          setFormData(prev => ({
            ...prev,
            name: response.data.nickname || '',
            email: response.data.email || '',
            // 다른 필드들은 빈 값으로 시작 (향후 프로필 API에서 가져올 수 있음)
          }));
        }
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'profile', label: '프로필', icon: 'ri-user-line' },
    { id: 'account', label: '계정', icon: 'ri-shield-user-line' },
    { id: 'appearance', label: '화면 설정', icon: 'ri-palette-line' },
    { id: 'notifications', label: '알림', icon: 'ri-notification-3-line' },
    { id: 'privacy', label: '연결 및 공개범위', icon: 'ri-lock-line' },
    { id: 'data', label: '데이터 관리', icon: 'ri-database-2-line' }
  ];

  const handleSave = () => {
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(skill => skill !== skillToRemove) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderProfileSettings = () => (
    <div className="flex gap-8">
      {/* 왼쪽 입력 폼 */}
      <div className="flex-1">
        <div className="bg-white rounded-lg p-6 border border-[#E1E4E6] space-y-6">
          {/* 프로필 사진 업로드 */}
          <div>
            <label className="block text-sm font-medium text-[#52616B] mb-3">프로필 사진</label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-[#C9D6DF] rounded-full flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <i className="ri-user-line text-2xl text-[#52616B]"></i>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="profile-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="profile-upload"
                  className="px-4 py-2 bg-[#34373b] text-[#F0F5F9] rounded-lg hover:bg-[#52616B] transition-colors cursor-pointer whitespace-nowrap inline-block"
                >
                  사진 업로드
                </label>
                <p className="text-xs text-[#52616B] mt-1">JPG, PNG 파일 (최대 5MB)</p>
              </div>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">이름 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={user?.nickname || "이름을 입력하세요"}
                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">직책 *</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="예: 시니어 개발자"
                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">회사명 *</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="소속 회사명을 입력하세요"
              className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium"
            />
          </div>

          {/* 연락처 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">이메일 *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder={user?.email || "이메일 주소를 입력하세요"}
                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">전화번호</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="010-0000-0000"
                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">주소</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="회사 또는 개인 주소를 입력하세요"
              rows={3}
              className="w-full px-3 py-2 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] text-sm resize-none"
            />
          </div>

          {/* 온라인 프로필 */}
          <div className="border-t border-[#E1E4E6] pt-6">
            <h3 className="text-lg font-semibold text-[#1E2022] mb-4">온라인 프로필</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">GitHub 사용자명</label>
                <input
                  type="text"
                  value={formData.githubUsername}
                  onChange={(e) => setFormData(prev => ({ ...prev, githubUsername: e.target.value }))}
                  placeholder="GitHub 사용자명만 입력"
                  className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium"
                />
                <p className="text-xs text-[#52616B] mt-1">https://github.com/ 다음의 사용자명만 입력하세요</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">포트폴리오 URL</label>
                <input
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                  placeholder="https://your-portfolio.com"
                  className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-between items-center pt-6 border-t border-[#E1E4E6]">
            <button className="px-4 py-2 text-[#52616B] hover:text-[#1E2022] cursor-pointer whitespace-nowrap">
              변경사항 취소
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all cursor-pointer whitespace-nowrap font-semibold shadow-md hover:shadow-lg"
            >
              변경사항 저장
            </button>
          </div>
        </div>
      </div>

      {/* 오른쪽 미리보기 */}
      <div className="w-80 flex-shrink-0">
        <div className="bg-white rounded-lg border border-[#E1E4E6] sticky top-6">
          {/* 미리보기 헤더 */}
          <div className="p-4 border-b border-[#E1E4E6] flex items-center justify-between">
            <h3 className="font-semibold text-[#1E2022]">미리보기</h3>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPreview}
                onChange={(e) => setShowPreview(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  showPreview ? 'bg-[#34373b]' : 'bg-[#C9D6DF]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showPreview ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
              <span className="text-sm text-[#52616B]">미리보기 표시</span>
            </label>
          </div>

          {/* 미리보기 내용 */}
          {showPreview && (
            <div className="p-6">
              {/* 프로필 사진과 기본 정보 */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-[#C9D6DF] rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                  ) : (
                    <i className="ri-user-line text-2xl text-[#52616B]"></i>
                  )}
                </div>
                <h4 className="text-lg font-semibold text-[#1E2022] mb-1">{formData.name || user?.nickname || '이름 없음'}</h4>
                <p className="text-[#52616B] text-sm mb-1">{formData.position || '직책 미설정'}</p>
                <p className="text-[#52616B] text-sm">{formData.company || '회사 미설정'}</p>
              </div>

              {/* 연락처 정보 */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 text-sm">
                  <i className="ri-mail-line text-[#52616B] w-4 h-4 flex items-center justify-center"></i>
                  <span className="text-[#1E2022]">{formData.email || user?.email || '이메일 없음'}</span>
                </div>
                {formData.phone && (
                  <div className="flex items-center space-x-3 text-sm">
                    <i className="ri-phone-line text-[#52616B] w-4 h-4 flex items-center justify-center"></i>
                    <span className="text-[#1E2022]">{formData.phone}</span>
                  </div>
                )}
                {formData.address && (
                  <div className="flex items-start space-x-3 text-sm">
                    <i className="ri-map-pin-line text-[#52616B] w-4 h-4 flex items-center justify-center mt-0.5"></i>
                    <span className="text-[#1E2022] whitespace-pre-line">{formData.address}</span>
                  </div>
                )}
              </div>

              {/* 온라인 프로필 링크 */}
              <div className="space-y-2">
                {formData.githubUsername && (
                  <button className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-[#F0F5F9] transition-colors cursor-pointer">
                    <i className="ri-github-line text-[#52616B] w-4 h-4 flex items-center justify-center"></i>
                    <span className="text-sm text-[#1E2022]">GitHub 프로필</span>
                    <i className="ri-external-link-line text-[#52616B] w-4 h-4 flex items-center justify-center ml-auto"></i>
                  </button>
                )}
                {formData.portfolioUrl && (
                  <button className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-[#F0F5F9] transition-colors cursor-pointer">
                    <i className="ri-global-line text-[#52616B] w-4 h-4 flex items-center justify-center"></i>
                    <span className="text-sm text-[#1E2022]">포트폴리오 웹사이트</span>
                    <i className="ri-external-link-line text-[#52616B] w-4 h-4 flex items-center justify-center ml-auto"></i>
                  </button>
                )}
              </div>

              {/* 프로필 정보 */}
              <div className="mt-6 pt-6 border-t border-[#E1E4E6]">
                <h5 className="font-medium text-[#1E2022] mb-3">프로필 정보</h5>
                <div className="space-y-2 text-xs text-[#52616B]">
                  {user && (
                    <div>• 가입일: {new Date().toLocaleDateString('ko-KR')}</div>
                  )}
                  {formData.skills.length > 0 && (
                    <div>• 설정된 스킬: {formData.skills.length}개</div>
                  )}
                  <div>• 프로필 완성도: {Math.round(((formData.name ? 1 : 0) + (formData.position ? 1 : 0) + (formData.company ? 1 : 0) + (formData.email ? 1 : 0)) / 4 * 100)}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[#1E2022] mb-4">계정 정보</h3>
        <div className="bg-white rounded-lg p-6 border border-[#E1E4E6] space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">로그인 이메일</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder={user?.email || "이메일 주소를 입력하세요"}
              className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">전화번호</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="010-0000-0000"
              className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium"
            />
          </div>

          <div className="border-t border-[#E1E4E6] pt-6">
            <h4 className="font-medium text-[#1E2022] mb-4">보안</h4>
            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 border border-[#C9D6DF] rounded-lg hover:bg-[#F0F5F9] transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#1E2022]">비밀번호 변경</div>
                    <div className="text-sm text-[#52616B]">마지막 변경: 2024년 1월 15일</div>
                  </div>
                  <i className="ri-arrow-right-s-line text-[#52616B] w-5 h-5 flex items-center justify-center"></i>
                </div>
              </button>

              <button className="w-full text-left px-4 py-3 border border-[#C9D6DF] rounded-lg hover:bg-[#F0F5F9] transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#1E2022]">2단계 인증 설정</div>
                    <div className="text-sm text-[#52616B]">계정 보안을 강화하세요</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-red-600">비활성화</span>
                    <i className="ri-arrow-right-s-line text-[#52616B] w-5 h-5 flex items-center justify-center"></i>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-red-600 mb-4">위험 구역</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-4">
          <button className="w-full text-left px-4 py-3 border border-red-300 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-red-700">계정 비활성화</div>
                <div className="text-sm text-red-600">계정을 일시적으로 비활성화합니다</div>
              </div>
              <i className="ri-arrow-right-s-line text-red-600 w-5 h-5 flex items-center justify-center"></i>
            </div>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-left px-4 py-3 border border-red-400 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-red-800">계정 영구 삭제</div>
                <div className="text-sm text-red-700">이 작업은 되돌릴 수 없습니다</div>
              </div>
              <i className="ri-arrow-right-s-line text-red-700 w-5 h-5 flex items-center justify-center"></i>
            </div>
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#34373b] text-[#F0F5F9] rounded-lg hover:bg-[#52616B] transition-colors cursor-pointer whitespace-nowrap"
        >
          변경사항 저장
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[#1E2022] mb-4">알림 설정</h3>
        <div className="bg-white rounded-lg p-6 border border-[#E1E4E6] space-y-6">
          {Object.entries({
            newConnection: '새로운 연결 요청',
            newMessage: '새 메시지 도착',
            networkActivity: '네트워크 활동',
            serviceAnnouncement: '서비스 공지'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between py-4 border-b border-[#F0F5F9] last:border-b-0">
              <div>
                <div className="font-medium text-[#1E2022]">{label}</div>
                <div className="text-sm text-[#52616B]">
                  {key === 'newConnection' && '다른 사용자가 연결을 요청할 때'}
                  {key === 'newMessage' && '새로운 메시지를 받았을 때'}
                  {key === 'networkActivity' && '멘션, 댓글 등 네트워크 활동이 있을 때'}
                  {key === 'serviceAnnouncement' && '서비스 업데이트 및 공지사항'}
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifications[key as keyof typeof formData.notifications].inApp}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          [key]: { ...prev.notifications[key as keyof typeof prev.notifications], inApp: e.target.checked }
                        }
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[#52616B]">인앱</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifications[key as keyof typeof formData.notifications].email}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          [key]: { ...prev.notifications[key as keyof typeof prev.notifications], email: e.target.checked }
                        }
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[#52616B]">이메일</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#34373b] text-[#F0F5F9] rounded-lg hover:bg-[#52616B] transition-colors cursor-pointer whitespace-nowrap"
        >
          변경사항 저장
        </button>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[#1E2022] mb-4">화면 설정</h3>
        <div className="bg-white rounded-lg p-6 border border-[#E1E4E6] space-y-6">
          {/* 다크모드 토글 */}
          <div className="flex items-center justify-between py-4 border-b border-[#F0F5F9]">
            <div>
              <div className="font-medium text-[#1E2022] mb-1">다크 모드</div>
              <div className="text-sm text-[#52616B]">어두운 테마로 전환하여 눈의 피로를 줄입니다</div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                darkMode ? 'bg-[#34373b]' : 'bg-[#C9D6DF]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 테마 미리보기 */}
          <div>
            <div className="font-medium text-[#1E2022] mb-4">테마 미리보기</div>
            <div className="grid grid-cols-2 gap-4">
              {/* 라이트 모드 미리보기 */}
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  !darkMode ? 'border-[#34373b] bg-[#F0F5F9]' : 'border-[#C9D6DF] bg-white'
                }`}
                onClick={() => setDarkMode(false)}
              >
                <div className="bg-white rounded p-3 mb-2 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-[#34373b] rounded"></div>
                    <div className="text-xs text-[#1E2022] font-medium">라이트 모드</div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-[#E1E4E6] rounded"></div>
                    <div className="h-2 bg-[#C9D6DF] rounded w-3/4"></div>
                  </div>
                </div>
                <div className="text-center">
                  <span className={`text-xs ${!darkMode ? 'text-[#34373b] font-medium' : 'text-[#52616B]'}`}>
                    라이트
                  </span>
                </div>
              </div>

              {/* 다크 모드 미리보기 */}
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  darkMode ? 'border-[#34373b] bg-[#F0F5F9]' : 'border-[#C9D6DF] bg-white'
                }`}
                onClick={() => setDarkMode(true)}
              >
                <div className="bg-[#1E2022] rounded p-3 mb-2 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-[#F0F5F9] rounded"></div>
                    <div className="text-xs text-[#F0F5F9] font-medium">다크 모드</div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-[#52616B] rounded"></div>
                    <div className="h-2 bg-[#34373b] rounded w-3/4"></div>
                  </div>
                </div>
                <div className="text-center">
                  <span className={`text-xs ${darkMode ? 'text-[#34373b] font-medium' : 'text-[#52616B]'}`}>
                    다크
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 자동 전환 설정 */}
          <div className="border-t border-[#E1E4E6] pt-6">
            <div className="font-medium text-[#1E2022] mb-4">자동 전환</div>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="themeMode"
                  value="manual"
                  defaultChecked
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium text-[#1E2022]">수동 설정</div>
                  <div className="text-sm text-[#52616B]">직접 선택한 테마를 계속 사용합니다</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="themeMode"
                  value="system"
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium text-[#1E2022]">시스템 설정 따르기</div>
                  <div className="text-sm text-[#52616B]">운영체제의 테마 설정에 따라 자동으로 변경됩니다</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="themeMode"
                  value="schedule"
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium text-[#1E2022]">시간대별 자동 전환</div>
                  <div className="text-sm text-[#52616B]">저녁 6시부터 아침 6시까지 다크 모드로 자동 전환됩니다</div>
                </div>
              </label>
            </div>
          </div>

          {/* 기타 화면 설정 */}
          <div className="border-t border-[#E1E4E6] pt-6">
            <div className="font-medium text-[#1E2022] mb-4">기타 설정</div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#1E2022]">화면 확대/축소</div>
                  <div className="text-sm text-[#52616B]">텍스트와 요소 크기를 조절합니다</div>
                </div>
                <select className="px-3 py-1 border border-[#C9D6DF] rounded text-sm pr-8" defaultValue="normal">
                  <option value="small">작게</option>
                  <option value="normal">보통</option>
                  <option value="large">크게</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#1E2022]">애니메이션 효과</div>
                  <div className="text-sm text-[#52616B]">페이지 전환 및 요소 애니메이션을 활성화합니다</div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#34373b] transition-colors cursor-pointer">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#34373b] text-[#F0F5F9] rounded-lg hover:bg-[#52616B] transition-colors cursor-pointer whitespace-nowrap"
        >
          변경사항 저장
        </button>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[#1E2022] mb-4">프라이버시 및 연결 설정</h3>
        <div className="bg-white rounded-lg p-6 border border-[#E1E4E6] space-y-6">
          <div>
            <label className="block font-medium text-[#1E2022] mb-3">내 프로필 공개 범위</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="profileVisibility"
                  value="public"
                  checked={formData.privacy.profileVisibility === 'public'}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, privacy: { ...prev.privacy, profileVisibility: e.target.value } }))
                  }
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium text-[#1E2022]">전체 공개</div>
                  <div className="text-sm text-[#52616B]">모든 사용자가 내 프로필을 볼 수 있습니다</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="profileVisibility"
                  value="connections"
                  checked={formData.privacy.profileVisibility === 'connections'}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, privacy: { ...prev.privacy, profileVisibility: e.target.value } }))
                  }
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium text-[#1E2022]">연결된 사용자에게만 공개</div>
                  <div className="text-sm text-[#52616B]">연결된 사용자만 내 프로필을 볼 수 있습니다</div>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-[#E1E4E6] pt-6">
            <label className="block font-medium text-[#1E2022] mb-3">연결 요청을 보낼 수 있는 사람</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="connectionRequests"
                  value="everyone"
                  checked={formData.privacy.connectionRequests === 'everyone'}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, privacy: { ...prev.privacy, connectionRequests: e.target.value } }))
                  }
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium text-[#1E2022]">모든 사람</div>
                  <div className="text-sm text-[#52616B]">누구나 연결 요청을 보낼 수 있습니다</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="connectionRequests"
                  value="mutual"
                  checked={formData.privacy.connectionRequests === 'mutual'}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, privacy: { ...prev.privacy, connectionRequests: e.target.value } }))
                  }
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium text-[#1E2022]">공통 연결이 있는 사람만</div>
                  <div className="text-sm text-[#52616B]">공통 연결이 있는 사용자만 연결 요청을 보낼 수 있습니다</div>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-[#E1E4E6] pt-6">
            <button className="w-full text-left px-4 py-3 border border-[#C9D6DF] rounded-lg hover:bg-[#F0F5F9] transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#1E2022]">차단된 사용자 관리</div>
                  <div className="text-sm text-[#52616B]">차단한 사용자 목록을 확인하고 관리합니다</div>
                </div>
                <i className="ri-arrow-right-s-line text-[#52616B] w-5 h-5 flex items-center justify-center"></i>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#34373b] text-[#F0F5F9] rounded-lg hover:bg-[#52616B] transition-colors cursor-pointer whitespace-nowrap"
        >
          변경사항 저장
        </button>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[#1E2022] mb-4">데이터 관리</h3>
        <div className="bg-white rounded-lg p-6 border border-[#E1E4E6] space-y-6">
          <div>
            <h4 className="font-medium text-[#1E2022] mb-4">데이터 내보내기</h4>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 border border-[#C9D6DF] rounded-lg hover:bg-[#F0F5F9] transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#1E2022]">연락처 전체 내보내기 (CSV)</div>
                    <div className="text-sm text-[#52616B]">Excel에서 열 수 있는 CSV 형식으로 다운로드</div>
                  </div>
                  <i className="ri-download-line text-[#52616B] w-5 h-5 flex items-center justify-center"></i>
                </div>
              </button>

              <button className="w-full text-left px-4 py-3 border border-[#C9D6DF] rounded-lg hover:bg-[#F0F5F9] transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#1E2022]">연락처 전체 내보내기 (vCard)</div>
                    <div className="text-sm text-[#52616B]">다른 연락처 앱에서 가져올 수 있는 vCard 형식</div>
                  </div>
                  <i className="ri-download-line text-[#52616B] w-5 h-5 flex items-center justify-center"></i>
                </div>
              </button>
            </div>
          </div>

          <div className="border-t border-[#E1E4E6] pt-6">
            <h4 className="font-medium text-[#1E2022] mb-4">데이터 가져오기</h4>
            <button className="w-full text-left px-4 py-3 border border-[#C9D6DF] rounded-lg hover:bg-[#F0F5F9] transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#1E2022]">외부 연락처 가져오기</div>
                  <div className="text-sm text-[#52616B]">CSV, vCard 파일에서 연락처를 가져옵니다</div>
                </div>
                <i className="ri-upload-line text-[#52616B] w-5 h-5 flex items-center justify-center"></i>
              </div>
            </button>
          </div>

          <div className="border-t border-[#E1E4E6] pt-6">
            <h4 className="font-medium text-[#1E2022] mb-4">저장 공간</h4>
            <div className="bg-[#F0F5F9] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#52616B]">사용 중</span>
                <span className="text-sm font-medium text-[#1E2022]">2.3GB / 5GB</span>
              </div>
              <div className="w-full bg-[#C9D6DF] rounded-full h-2">
                <div className="bg-[#34373b] h-2 rounded-full" style={{ width: '46%' }}></div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E1E4E6] pt-6">
            <button className="px-4 py-2 text-[#52616B] hover:text-[#1E2022] cursor-pointer whitespace-nowrap">
              기본값으로 되돌리기
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#34373b] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#52616B]">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full max-w-7xl mx-auto w-full">
      {/* 왼쪽 카테고리 메뉴 */}
      <div className="w-80 bg-gradient-to-br from-slate-50 to-blue-50 border-r-2 border-slate-300 flex-shrink-0 shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-black text-slate-800 mb-6">설정</h2>
          <nav className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all cursor-pointer whitespace-nowrap font-semibold shadow-sm ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-white hover:text-slate-800 hover:shadow-md'
                }`}
              >
                <i className={`${category.icon} w-5 h-5 flex items-center justify-center`}></i>
                <span>{category.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 오른쪽 설정 내용 */}
      <div className="flex-1 p-8 overflow-y-auto min-w-0 bg-gradient-to-br from-white to-slate-50">
        {activeCategory === 'profile' && renderProfileSettings()}
        {activeCategory === 'account' && renderAccountSettings()}
        {activeCategory === 'appearance' && renderAppearanceSettings()}
        {activeCategory === 'notifications' && renderNotificationSettings()}
        {activeCategory === 'privacy' && renderPrivacySettings()}
        {activeCategory === 'data' && renderDataSettings()}
      </div>

      {/* 저장 완료 메시지 */}
      {showSaveMessage && (
        <div className="fixed top-6 right-6 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <i className="ri-check-line w-5 h-5 flex items-center justify-center"></i>
            <span>프로필이 성공적으로 업데이트되었습니다.</span>
          </div>
        </div>
      )}

      {/* 계정 삭제 확인 팝업 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">계정 영구 삭제</h3>
            <p className="text-[#52616B] mb-6">
              이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제되며, 연결된 모든 정보와 메시지도 함께 삭제됩니다.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-[#52616B] hover:text-[#1E2022] cursor-pointer whitespace-nowrap"
              >
                취소
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
                영구 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
