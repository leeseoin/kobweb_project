
'use client';

import { useCreateContact } from '../hooks/useApi';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';

export default function AddContactPage() {
  const router = useRouter();
  const { createContact, loading: isCreating, error: createError } = useCreateContact();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    phone: '',
    location: '',
    github: '',
    notion: '',
    linkedin: '',
    website: '',
    skills: [] as string[],
    interests: [] as string[],
    connectionType: 'direct',
    connectionMethod: '',
    relationshipNote: '',
    status: 'Active'
  });

  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleInterestAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const interest = interestInput.trim();
      if (interest && !formData.interests.includes(interest) && formData.interests.length < 10) {
        setFormData(prev => ({
          ...prev,
          interests: [...prev.interests, interest]
        }));
        setInterestInput('');
      }
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleInterestRemove = (interestToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.email) {
      setSubmitMessage('이름과 이메일은 필수 항목입니다.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 백엔드 API에 맞는 형태로 데이터 변환
      const businessCardData = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        position: formData.position,
        skills: formData.skills
      };

      const newBusinessCard = await createContact(businessCardData);

      setSubmitMessage('명함 등록 요청이 전송되었습니다! 상대방이 수락하면 명함이 등록됩니다.');

      // 3초 후 폼 초기화
      setTimeout(() => {
        setSubmitMessage('');
        setFormData({
          name: '',
          email: '',
          company: '',
          position: '',
          phone: '',
          location: '',
          github: '',
          notion: '',
          linkedin: '',
          website: '',
          skills: [],
          interests: [],
          connectionType: 'direct',
          connectionMethod: '',
          relationshipNote: '',
          status: 'Active'
        });
        setSkillInput('');
        setInterestInput('');

        // 대시보드로 이동
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('명함 등록 실패:', error);
      setSubmitMessage('명함 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F5F9]">
      <Header />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1E2022] mb-2">새 명함 등록</h1>
              <p className="text-[#52616B]">새로운 인맥의 정보를 등록하여 관계도를 확장하세요</p>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 bg-[#E1E4E6] hover:bg-[#C9D6DF] text-[#1E2022] px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
              <span>대시보드로 돌아가기</span>
            </Link>
          </div>
          
          <div className="bg-white border border-[#E1E4E6] rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <i className="ri-information-line w-5 h-5 text-[#34373b] flex items-center justify-center"></i>
              <div>
                <p className="text-[#1E2022] text-sm font-medium">등록된 명함은 어떻게 활용되나요?</p>
                <p className="text-[#52616B] text-xs mt-1">• 관계도에서 시각적으로 네트워크 확인 • 연락처 목록에서 상세 정보 조회 • 관계 유형별 분류 및 관리</p>
              </div>
            </div>
          </div>
        </div>

        <form id="contact-form" onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 섹션 */}
          <div className="bg-white border border-[#E1E4E6] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-[#1E2022] mb-4 flex items-center">
              <i className="ri-user-line w-5 h-5 mr-2 flex items-center justify-center"></i>
              기본 정보
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#1E2022] mb-2 text-sm font-medium">이름 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="홍길동"
                  className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#1E2022] mb-2 text-sm font-medium">이메일 *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="hong@company.com"
                  className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#1E2022] mb-2 text-sm font-medium">회사명</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="삼성전자"
                  className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#1E2022] mb-2 text-sm font-medium">직책</label>
                <input
                  type="text" 
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="프로덕트 매니저"
                  className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#1E2022] mb-2 text-sm font-medium">연락처</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="010-1234-5678"
                  className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#1E2022] mb-2 text-sm font-medium">지역</label>
                <input
                  type="text"
                  name="location" 
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="서울시 강남구"
                  className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 온라인 프로필 섹션 */}
          <div className="bg-white border border-[#E1E4E6] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-[#1E2022] mb-4 flex items-center">
              <i className="ri-links-line w-5 h-5 mr-2 flex items-center justify-center"></i>
              온라인 프로필
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#1E2022] mb-2 text-sm font-medium">GitHub</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username"
                  className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#1E2022] mb-2 text-sm font-medium">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#1E2022] mb-2 text-sm font-medium">Notion</label>
                <input
                  type="url"
                  name="notion"
                  value={formData.notion}
                  onChange={handleInputChange}
                  placeholder="https://notion.so/username"
                  className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#1E2022] mb-2 text-sm font-medium">개인 웹사이트</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://mywebsite.com"
                  className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 전문성 및 관심사 섹션 */}
          <div className="bg-white border border-[#E1E4E6] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-[#1E2022] mb-4 flex items-center">
              <i className="ri-lightbulb-line w-5 h-5 mr-2 flex items-center justify-center"></i>
              전문성 및 관심사
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[#1E2022] mb-2 text-sm font-medium">기술 스택 및 전문 분야</label>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillAdd}
                  placeholder="React, Python, 데이터 분석 등을 입력하고 엔터를 누르세요"
                  className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
                
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
                          className="ml-2 text-[#C9D6DF] hover:text-white cursor-pointer"
                        >
                          <i className="ri-close-line w-3 h-3 flex items-center justify-center"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[#1E2022] mb-2 text-sm font-medium">관심사 및 취미</label>
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={handleInterestAdd}
                  placeholder="독서, 여행, 스타트업 등을 입력하고 엔터를 누르세요"
                  className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
                
                {formData.interests.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {formData.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center bg-[#52616B] text-white px-3 py-1 rounded-full text-sm"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => handleInterestRemove(interest)}
                          className="ml-2 text-[#C9D6DF] hover:text-white cursor-pointer"
                        >
                          <i className="ri-close-line w-3 h-3 flex items-center justify-center"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 관계 정보 섹션 */}
          <div className="bg-white border border-[#E1E4E6] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-[#1E2022] mb-4 flex items-center">
              <i className="ri-share-line w-5 h-5 mr-2 flex items-center justify-center"></i>
              관계 정보
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#1E2022] mb-2 text-sm font-medium">관계 유형</label>
                  <select
                    name="connectionType"
                    value={formData.connectionType}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] focus:border-[#34373b] focus:outline-none cursor-pointer pr-8"
                  >
                    <option value="direct">직접 연결</option>
                    <option value="mutual">공통 지인을 통해</option>
                    <option value="event">행사에서 만남</option>
                    <option value="online">온라인으로 연결</option>
                    <option value="work">업무 관계</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1E2022] mb-2 text-sm font-medium">만난 경로</label>
                  <input
                    type="text"
                    name="connectionMethod"
                    value={formData.connectionMethod}
                    onChange={handleInputChange}
                    placeholder="컨퍼런스, 소개, 프로젝트 등"
                    className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#1E2022] mb-2 text-sm font-medium">관계 메모</label>
                <textarea
                  name="relationshipNote"
                  value={formData.relationshipNote}
                  onChange={handleInputChange}
                  placeholder="이 사람과의 관계나 특별한 점을 기록해보세요 (예: 함께 진행한 프로젝트, 공통 관심사 등)"
                  rows={3}
                  maxLength={500}
                  className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none resize-none"
                />
                <div className="text-right text-xs text-[#52616B] mt-1">
                  {formData.relationshipNote.length}/500
                </div>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="bg-white border border-[#E1E4E6] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#1E2022] font-medium">명함 등록 준비 완료</p>
                <p className="text-[#52616B] text-sm">등록 후 관계도와 연락처 목록에서 확인할 수 있습니다</p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || isCreating}
                className="bg-[#34373b] hover:bg-[#52616B] disabled:bg-[#C9D6DF] text-white px-8 py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-medium text-lg"
              >
                {(isSubmitting || isCreating) ? (
                  <div className="flex items-center space-x-2">
                    <i className="ri-loader-4-line w-5 h-5 animate-spin flex items-center justify-center"></i>
                    <span>등록 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <i className="ri-user-add-line w-5 h-5 flex items-center justify-center"></i>
                    <span>명함 등록하기</span>
                  </div>
                )}
              </button>
            </div>

            {(submitMessage || createError) && (
              <div className={`mt-4 p-4 rounded-lg text-sm border ${submitMessage?.includes('성공') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                <div className="flex items-center space-x-2">
                  <i className={`w-4 h-4 flex items-center justify-center ${submitMessage?.includes('성공') ? 'ri-check-line' : 'ri-error-warning-line'}`}></i>
                  <span>{submitMessage || createError}</span>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
