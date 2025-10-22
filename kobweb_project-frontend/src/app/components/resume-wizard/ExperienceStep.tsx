
'use client';

import { useState } from 'react';

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
  achievements: string[];
}

interface ExperienceStepProps {
  data: Experience[];
  onUpdate: (data: Experience[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function ExperienceStep({ data, onUpdate, onNext, onPrevious }: ExperienceStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      isCurrentJob: false,
      achievements: ['']
    };
    onUpdate([...data, newExperience]);
    setExpandedIndex(data.length);
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updatedData = [...data];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value
    };
    onUpdate(updatedData);
  };

  const addAchievement = (experienceIndex: number) => {
    const updatedData = [...data];
    updatedData[experienceIndex].achievements.push('');
    onUpdate(updatedData);
  };

  const updateAchievement = (experienceIndex: number, achievementIndex: number, value: string) => {
    const updatedData = [...data];
    updatedData[experienceIndex].achievements[achievementIndex] = value;
    onUpdate(updatedData);
  };

  const removeAchievement = (experienceIndex: number, achievementIndex: number) => {
    const updatedData = [...data];
    updatedData[experienceIndex].achievements.splice(achievementIndex, 1);
    onUpdate(updatedData);
  };

  const removeExperience = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onUpdate(updatedData);
    setExpandedIndex(null);
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E2022] mb-2">경력 사항</h2>
        <p className="text-[#52616B]">성장 과정과 성과를 구체적으로 보여주세요</p>
      </div>

      <div className="space-y-6">
        {data.map((experience, index) => (
          <div key={experience.id} className="border border-[#E1E4E6] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#34373b] rounded-lg flex items-center justify-center">
                  <i className="ri-briefcase-line text-[#F0F5F9] w-5 h-5 flex items-center justify-center"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E2022]">
                    {experience.company || '회사명'} - {experience.position || '직책'}
                  </h3>
                  <p className="text-sm text-[#52616B]">
                    {experience.startDate} ~ {experience.isCurrentJob ? '현재' : experience.endDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleExpanded(index)}
                  className="p-2 text-[#52616B] hover:text-[#1E2022] transition-colors"
                >
                  <i className={`ri-${expandedIndex === index ? 'arrow-up' : 'arrow-down'}-s-line w-5 h-5 flex items-center justify-center`}></i>
                </button>
                <button
                  onClick={() => removeExperience(index)}
                  className="p-2 text-red-500 hover:text-red-600 transition-colors"
                >
                  <i className="ri-delete-bin-line w-5 h-5 flex items-center justify-center"></i>
                </button>
              </div>
            </div>

            {expandedIndex === index && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#52616B] mb-2">회사명 *</label>
                    <input
                      type="text"
                      value={experience.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      placeholder="회사명을 입력하세요"
                      className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#52616B] mb-2">직책 *</label>
                    <input
                      type="text"
                      value={experience.position}
                      onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      placeholder="직책을 입력하세요"
                      className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#52616B] mb-2">시작일 *</label>
                    <input
                      type="month"
                      value={experience.startDate}
                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                      className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#52616B] mb-2">종료일</label>
                    <div className="space-y-2">
                      <input
                        type="month"
                        value={experience.endDate}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                        disabled={experience.isCurrentJob}
                        className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent disabled:bg-gray-100"
                      />
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={experience.isCurrentJob}
                          onChange={(e) => updateExperience(index, 'isCurrentJob', e.target.checked)}
                          className="w-4 h-4 text-[#34373b] rounded focus:ring-2 focus:ring-[#34373b]"
                        />
                        <span className="text-sm text-[#52616B]">현재 재직 중</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#52616B] mb-2">주요 업무 및 성과</label>
                  <div className="space-y-3">
                    {experience.achievements.map((achievement, achievementIndex) => (
                      <div key={achievementIndex} className="flex items-start space-x-2">
                        <span className="text-[#52616B] mt-3">•</span>
                        <div className="flex-1">
                          <textarea
                            value={achievement}
                            onChange={(e) => updateAchievement(index, achievementIndex, e.target.value)}
                            placeholder="구체적인 성과를 수치와 함께 작성하세요. 예: 레거시 코드 리팩토링을 통해 페이지 로딩 속도를 30% 개선하여 이탈률 5% 감소에 기여"
                            rows={2}
                            className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent resize-none"
                          />
                        </div>
                        {experience.achievements.length > 1 && (
                          <button
                            onClick={() => removeAchievement(index, achievementIndex)}
                            className="mt-3 p-1 text-red-500 hover:text-red-600 transition-colors"
                          >
                            <i className="ri-close-line w-4 h-4 flex items-center justify-center"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addAchievement(index)}
                      className="flex items-center space-x-2 text-[#34373b] hover:text-[#52616B] transition-colors"
                    >
                      <i className="ri-add-line w-4 h-4 flex items-center justify-center"></i>
                      <span className="text-sm">업무/성과 추가</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#52616B] mt-2">
                    '무엇을 했다'가 아닌 '어떤 문제를 어떻게 해결하여 어떤 결과를 만들었는지'를 구체적으로 작성하세요
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addExperience}
          className="w-full border-2 border-dashed border-[#C9D6DF] rounded-lg p-8 text-center hover:border-[#34373b] hover:bg-[#F0F5F9] transition-colors cursor-pointer"
        >
          <i className="ri-add-line text-2xl text-[#52616B] mb-2 w-6 h-6 flex items-center justify-center mx-auto"></i>
          <p className="text-[#52616B] font-medium">경력 추가하기</p>
          <p className="text-sm text-[#52616B] mt-1">새로운 경력을 추가해보세요</p>
        </button>
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
          다음 단계로
        </button>
      </div>
    </div>
  );
}
