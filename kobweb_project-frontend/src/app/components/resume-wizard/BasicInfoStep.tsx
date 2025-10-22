
'use client';

import { useState } from 'react';

interface BasicInfo {
  name: string;
  tagline: string;
  position: string;
  email: string;
  phone: string;
  profileImage: string;
  links: {
    github: string;
    linkedin: string;
    website: string;
    behance: string;
    dribbble: string;
  };
}

interface BasicInfoStepProps {
  data: BasicInfo;
  onUpdate: (data: BasicInfo) => void;
  onNext: () => void;
}

export default function BasicInfoStep({ data, onUpdate, onNext }: BasicInfoStepProps) {
  const [profileImage, setProfileImage] = useState(data.profileImage);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      onUpdate({
        ...data,
        [parent]: {
          ...(data as any)[parent],
          [child]: value
        }
      });
    } else {
      onUpdate({
        ...data,
        [field]: value
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setProfileImage(imageUrl);
        handleInputChange('profileImage', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (data.name && data.email && data.position) {
      onNext();
    }
  };

  const socialLinks = [
    { key: 'github', label: 'GitHub', icon: 'ri-github-line', placeholder: 'username' },
    { key: 'linkedin', label: 'LinkedIn', icon: 'ri-linkedin-line', placeholder: 'in/username' },
    { key: 'website', label: '개인 웹사이트', icon: 'ri-global-line', placeholder: 'https://yoursite.com' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E2022] mb-2">기본 정보</h2>
        <p className="text-[#52616B]">당신의 첫인상을 결정하는 핵심 정보를 입력해주세요</p>
      </div>

      <div className="space-y-8">
        {/* 프로필 사진 */}
        <div className="text-center">
          <label className="block text-sm font-medium text-[#52616B] mb-4">프로필 사진</label>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-[#C9D6DF] rounded-full flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <i className="ri-user-line text-3xl text-[#52616B] w-8 h-8 flex items-center justify-center"></i>
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
              <p className="text-xs text-[#52616B] mt-2">JPG, PNG 파일 (최대 5MB)</p>
            </div>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#52616B] mb-2">이름 *</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="홍길동"
              className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#52616B] mb-2">희망 직무 *</label>
            <input
              type="text"
              value={data.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="Frontend Developer"
              className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#52616B] mb-2">한 줄 소개</label>
          <input
            type="text"
            value={data.tagline}
            onChange={(e) => handleInputChange('tagline', e.target.value)}
            placeholder="데이터로 더 나은 사용자 경험을 만드는 개발자"
            className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
          />
          <p className="text-xs text-[#52616B] mt-1">자신을 한 문장으로 표현해보세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#52616B] mb-2">이메일 *</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#52616B] mb-2">전화번호</label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="010-1234-5678"
              className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
            />
          </div>
        </div>

        {/* 소셜 링크 */}
        <div>
          <label className="block text-sm font-medium text-[#52616B] mb-4">온라인 프로필</label>
          <div className="space-y-4">
            {socialLinks.map((link) => (
              <div key={link.key} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#F0F5F9] rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`${link.icon} text-[#52616B] w-5 h-5 flex items-center justify-center`}></i>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#52616B] mb-1">{link.label}</label>
                  <input
                    type="text"
                    value={data.links[link.key as keyof typeof data.links]}
                    onChange={(e) => handleInputChange(`links.${link.key}`, e.target.value)}
                    placeholder={link.placeholder}
                    className="w-full px-4 py-2 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#52616B] mt-2">
            GitHub, LinkedIn 등의 프로필은 채용 담당자가 가장 먼저 확인하는 정보입니다
          </p>
        </div>
      </div>

      <div className="flex justify-end mt-12">
        <button
          onClick={handleNext}
          disabled={!data.name || !data.email || !data.position}
          className="px-8 py-3 bg-[#34373b] text-[#F0F5F9] rounded-lg hover:bg-[#52616B] transition-colors cursor-pointer whitespace-nowrap font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음 단계로
        </button>
      </div>
    </div>
  );
}
