
'use client';

import { useState, useEffect } from 'react';
import { useCreateContact, useUpdateContact } from '../hooks/useApi';
import { BusinessCard } from '../lib/api';

interface BusinessCardEditorProps {
  businessCard?: BusinessCard;
  onSave?: (businessCard: BusinessCard) => void;
  onCancel?: () => void;
}

export default function BusinessCardEditor({ businessCard, onSave, onCancel }: BusinessCardEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [formData, setFormData] = useState({
    name: businessCard?.name || '',
    position: businessCard?.position || '',
    company: businessCard?.company || '',
    email: businessCard?.email || '',
    phone: '',
    address: '',
    githubUsername: '',
    portfolioUrl: '',
    skills: businessCard?.skills || []
  });

  const [skillInput, setSkillInput] = useState('');

  const { createContact, loading: createLoading, error: createError } = useCreateContact();
  const { updateContact, loading: updateLoading, error: updateError } = useUpdateContact();

  const isLoading = createLoading || updateLoading;
  const error = createError || updateError;

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      return;
    }

    try {
      const businessCardData = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        position: formData.position,
        skills: formData.skills
      };

      let result;
      if (businessCard?.businessCardId) {
        // 기존 명함 수정
        result = await updateContact(businessCard.businessCardId, businessCardData);
      } else {
        // 새 명함 생성
        result = await createContact(businessCardData);
      }

      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);

      if (onSave) {
        onSave(result);
      }
    } catch (error) {
      console.error('명함 저장 실패:', error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = skillInput.trim();
      if (skill && !formData.skills.includes(skill) && formData.skills.length < 15) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, skill]
        }));
        setSkillInput('');
      }
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
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

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E2022] mb-2">프로필 수정</h1>
        <p className="text-[#52616B]">개인 정보와 명함 정보를 수정하고 관리하세요</p>
      </div>

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
                <label className="block text-sm font-medium text-[#52616B] mb-2">이름 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="이름을 입력하세요"
                  className="w-full px-3 py-2 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#52616B] mb-2">직책 *</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="예: 시니어 개발자"
                  className="w-full px-3 py-2 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#52616B] mb-2">회사명 *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="소속 회사명을 입력하세요"
                className="w-full px-3 py-2 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] text-sm"
              />
            </div>

            {/* 연락처 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#52616B] mb-2">이메일 *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="이메일 주소를 입력하세요"
                  className="w-full px-3 py-2 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#52616B] mb-2">전화번호</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="010-0000-0000"
                  className="w-full px-3 py-2 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#52616B] mb-2">주소</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="회사 또는 개인 주소를 입력하세요"
                rows={3}
                className="w-full px-3 py-2 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] text-sm resize-none"
              />
            </div>

            {/* 기술 스택 및 전문 분야 */}
            <div className="border-t border-[#E1E4E6] pt-6">
              <h3 className="text-lg font-semibold text-[#1E2022] mb-4">기술 스택 및 전문 분야</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#52616B] mb-2">기술 스택</label>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillAdd}
                    placeholder="React, Python, 데이터 분석 등을 입력하고 엔터를 누르세요"
                    className="w-full px-3 py-2 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] text-sm"
                  />
                  <p className="text-xs text-[#52616B] mt-1">Enter 키 또는 쉼표로 스킬을 추가할 수 있습니다</p>

                  {formData.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center bg-[#34373b] text-white px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleSkillRemove(skill)}
                            className="ml-2 text-[#C9D6DF] hover:text-white"
                          >
                            <i className="ri-close-line w-3 h-3"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 온라인 프로필 */}
            <div className="border-t border-[#E1E4E6] pt-6">
              <h3 className="text-lg font-semibold text-[#1E2022] mb-4">온라인 프로필</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#52616B] mb-2">GitHub 사용자명</label>
                  <input
                    type="text"
                    value={formData.githubUsername}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubUsername: e.target.value }))}
                    placeholder="GitHub 사용자명만 입력"
                    className="w-full px-3 py-2 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] text-sm"
                  />
                  <p className="text-xs text-[#52616B] mt-1">https://github.com/ 다음의 사용자명만 입력하세요</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#52616B] mb-2">포트폴리오 URL</label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                    placeholder="https://your-portfolio.com"
                    className="w-full px-3 py-2 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="pt-6 border-t border-[#E1E4E6]">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-[#52616B] hover:text-[#1E2022] disabled:text-[#C9D6DF] cursor-pointer whitespace-nowrap"
                >
                  변경사항 취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading || !formData.name || !formData.email}
                  className="px-6 py-2 bg-[#34373b] text-[#F0F5F9] rounded-lg hover:bg-[#52616B] disabled:bg-[#C9D6DF] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <i className="ri-loader-4-line w-4 h-4 animate-spin"></i>
                      <span>저장 중...</span>
                    </div>
                  ) : (
                    businessCard?.businessCardId ? '변경사항 저장' : '명함 등록'
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  <div className="flex items-center space-x-2">
                    <i className="ri-error-warning-line w-4 h-4"></i>
                    <span>{error}</span>
                  </div>
                </div>
              )}
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
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  showPreview ? 'bg-[#34373b]' : 'bg-[#C9D6DF]'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showPreview ? 'translate-x-6' : 'translate-x-1'
                  }`} />
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
                  <h4 className="text-lg font-semibold text-[#1E2022] mb-1">{formData.name}</h4>
                  <p className="text-[#52616B] text-sm mb-1">{formData.position}</p>
                  <p className="text-[#52616B] text-sm">{formData.company}</p>
                </div>

                {/* 연락처 정보 */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 text-sm">
                    <i className="ri-mail-line text-[#52616B] w-4 h-4 flex items-center justify-center"></i>
                    <span className="text-[#1E2022]">{formData.email}</span>
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

                {/* 기술 스택 */}
                {formData.skills.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-medium text-[#1E2022] mb-3 text-sm">기술 스택</h5>
                    <div className="flex flex-wrap gap-1">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-block bg-[#E1E4E6] text-[#1E2022] px-2 py-1 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

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

                {/* 명함 정보 */}
                <div className="mt-6 pt-6 border-t border-[#E1E4E6]">
                  <h5 className="font-medium text-[#1E2022] mb-3">명함 정보</h5>
                  <div className="space-y-2 text-xs text-[#52616B]">
                    {businessCard?.createdAt && (
                      <div>• 등록일: {new Date(businessCard.createdAt).toLocaleDateString('ko-KR')}</div>
                    )}
                    {businessCard?.updatedAt && (
                      <div>• 수정일: {new Date(businessCard.updatedAt).toLocaleDateString('ko-KR')}</div>
                    )}
                    {formData.skills.length > 0 && (
                      <div>• 보유 스킬: {formData.skills.length}개</div>
                    )}
                    {!businessCard && (
                      <div>• 새로운 명함 작성 중</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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
    </div>
  );
}
