
'use client';

import { useState } from 'react';

interface Education {
  id: string;
  school: string;
  major: string;
  startDate: string;
  endDate: string;
  degree: string;
}

interface Additional {
  awards: string[];
  certifications: string[];
  courses: string[];
}

interface EducationStepProps {
  data: Education[];
  additional: Additional;
  onUpdateEducation: (data: Education[]) => void;
  onUpdateAdditional: (data: Additional) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function EducationStep({ 
  data, 
  additional, 
  onUpdateEducation, 
  onUpdateAdditional, 
  onNext, 
  onPrevious 
}: EducationStepProps) {
  const [expandedEducation, setExpandedEducation] = useState<number | null>(null);
  const [currentInputs, setCurrentInputs] = useState({
    award: '',
    certification: '',
    course: ''
  });

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      school: '',
      major: '',
      startDate: '',
      endDate: '',
      degree: ''
    };
    onUpdateEducation([...data, newEducation]);
    setExpandedEducation(data.length);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updatedData = [...data];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value
    };
    onUpdateEducation(updatedData);
  };

  const removeEducation = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onUpdateEducation(updatedData);
    setExpandedEducation(null);
  };

  const toggleEducationExpanded = (index: number) => {
    setExpandedEducation(expandedEducation === index ? null : index);
  };

  const addAdditionalItem = (type: keyof Additional, value: string) => {
    if (value.trim() && !additional[type].includes(value.trim())) {
      onUpdateAdditional({
        ...additional,
        [type]: [...additional[type], value.trim()]
      });
      setCurrentInputs({
        ...currentInputs,
        [type]: ''
      });
    }
  };

  const removeAdditionalItem = (type: keyof Additional, index: number) => {
    onUpdateAdditional({
      ...additional,
      [type]: additional[type].filter((_, i) => i !== index)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: keyof Additional) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAdditionalItem(type, currentInputs[type]);
    }
  };

  const degreeOptions = [
    '고등학교 졸업',
    '전문학사',
    '학사',
    '석사',
    '박사',
    '기타'
  ];

  const additionalSections = [
    {
      key: 'awards' as keyof Additional,
      title: '수상 경력',
      icon: 'ri-trophy-line',
      placeholder: '수상 내역을 입력하세요 (예: 2023 해커톤 대상)',
      examples: ['해커톤 대상', 'ICT 어워드', '프로그래밍 대회 우수상', '졸업작품 최우수상']
    },
    {
      key: 'certifications' as keyof Additional,
      title: '자격증',
      icon: 'ri-medal-line',
      placeholder: '자격증명을 입력하세요 (예: 정보처리기사)',
      examples: ['정보처리기사', 'AWS Solutions Architect', '컴활 1급', 'TOEIC 900점']
    },
    {
      key: 'courses' as keyof Additional,
      title: '수료 과정',
      icon: 'ri-graduation-cap-line',
      placeholder: '교육 과정을 입력하세요 (예: 부스트캠프 웹개발 과정)',
      examples: ['부스트캠프 웹개발', '삼성 SW 아카데미', '구글 개발자 부트캠프', '네이버 AI 교육 과정']
    }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E2022] mb-2">학력 및 기타 정보</h2>
        <p className="text-[#52616B]">학력과 추가적인 성취를 기록해주세요</p>
      </div>

      <div className="space-y-8">
        {/* 학력 섹션 */}
        <div>
          <h3 className="text-lg font-semibold text-[#1E2022] mb-4">학력</h3>
          <div className="space-y-4">
            {data.map((education, index) => (
              <div key={education.id} className="border border-[#E1E4E6] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-[#34373b] rounded-lg flex items-center justify-center">
                      <i className="ri-school-line text-[#F0F5F9] w-5 h-5 flex items-center justify-center"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1E2022]">
                        {education.school || '학교명'} - {education.major || '전공'}
                      </h4>
                      <p className="text-sm text-[#52616B]">
                        {education.startDate} ~ {education.endDate} | {education.degree}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleEducationExpanded(index)}
                      className="p-2 text-[#52616B] hover:text-[#1E2022] transition-colors"
                    >
                      <i className={`ri-${expandedEducation === index ? 'arrow-up' : 'arrow-down'}-s-line w-5 h-5 flex items-center justify-center`}></i>
                    </button>
                    <button
                      onClick={() => removeEducation(index)}
                      className="p-2 text-red-500 hover:text-red-600 transition-colors"
                    >
                      <i className="ri-delete-bin-line w-5 h-5 flex items-center justify-center"></i>
                    </button>
                  </div>
                </div>

                {expandedEducation === index && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#52616B] mb-2">학교명 *</label>
                        <input
                          type="text"
                          value={education.school}
                          onChange={(e) => updateEducation(index, 'school', e.target.value)}
                          placeholder="서울대학교"
                          className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#52616B] mb-2">전공 *</label>
                        <input
                          type="text"
                          value={education.major}
                          onChange={(e) => updateEducation(index, 'major', e.target.value)}
                          placeholder="컴퓨터공학과"
                          className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#52616B] mb-2">시작일 *</label>
                        <input
                          type="month"
                          value={education.startDate}
                          onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                          className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#52616B] mb-2">종료일 *</label>
                        <input
                          type="month"
                          value={education.endDate}
                          onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                          className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#52616B] mb-2">학위 *</label>
                        <select
                          value={education.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent cursor-pointer pr-8"
                        >
                          <option value="">선택하세요</option>
                          {degreeOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={addEducation}
              className="w-full border-2 border-dashed border-[#C9D6DF] rounded-lg p-6 text-center hover:border-[#34373b] hover:bg-[#F0F5F9] transition-colors cursor-pointer"
            >
              <i className="ri-add-line text-xl text-[#52616B] mb-2 w-5 h-5 flex items-center justify-center mx-auto"></i>
              <p className="text-[#52616B] font-medium">학력 추가하기</p>
            </button>
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div className="space-y-6">
          {additionalSections.map((section) => (
            <div key={section.key} className="border border-[#E1E4E6] rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#34373b] rounded-lg flex items-center justify-center">
                  <i className={`${section.icon} text-[#F0F5F9] w-5 h-5 flex items-center justify-center`}></i>
                </div>
                <h4 className="text-lg font-semibold text-[#1E2022]">{section.title}</h4>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={currentInputs[section.key]}
                    onChange={(e) => setCurrentInputs({
                      ...currentInputs,
                      [section.key]: e.target.value
                    })}
                    onKeyPress={(e) => handleKeyPress(e, section.key)}
                    placeholder={section.placeholder}
                    className="flex-1 px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
                  />
                  <button
                    onClick={() => addAdditionalItem(section.key, currentInputs[section.key])}
                    className="px-4 py-3 bg-[#34373b] text-[#F0F5F9] rounded-lg hover:bg-[#52616B] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    추가
                  </button>
                </div>
              </div>

              {additional[section.key].length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {additional[section.key].map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-2 bg-[#34373b] text-[#F0F5F9] px-3 py-1 rounded-full text-sm"
                      >
                        <span>{item}</span>
                        <button
                          onClick={() => removeAdditionalItem(section.key, index)}
                          className="hover:text-red-300 transition-colors"
                        >
                          <i className="ri-close-line w-4 h-4 flex items-center justify-center"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-[#52616B] mb-2">예시:</p>
                <div className="flex flex-wrap gap-2">
                  {section.examples.filter(example => !additional[section.key].includes(example)).map((example) => (
                    <button
                      key={example}
                      onClick={() => addAdditionalItem(section.key, example)}
                      className="px-3 py-1 bg-[#F0F5F9] text-[#52616B] rounded-full text-sm hover:bg-[#E1E4E6] transition-colors cursor-pointer border border-[#E1E4E6]"
                    >
                      + {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-12">
        <button
          onClick={onPrevious}
          className="px-8 py-3 bg-[#E1E4E6] text-[#1E2022] rounded-lg hover:bg-[#C9D6DF] transition-colors cursor-pointer whitespace-nowrap font-medium"
        >
          이전 단계
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-[#34373b] text-[#F0F5F9] rounded-lg hover:bg-[#52616B] transition-colors cursor-pointer whitespace-nowrap font-medium"
        >
          미리보기
        </button>
      </div>
    </div>
  );
}
