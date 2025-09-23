
'use client';

import { useState } from 'react';

interface Skills {
  frontend: string[];
  backend: string[];
  design: string[];
  collaboration: string[];
  other: string[];
}

interface SkillsStepProps {
  data: Skills;
  onUpdate: (data: Skills) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function SkillsStep({ data, onUpdate, onNext, onPrevious }: SkillsStepProps) {
  const [currentInput, setCurrentInput] = useState<{[key: string]: string}>({
    frontend: '',
    backend: '',
    design: '',
    collaboration: '',
    other: ''
  });

  const skillCategories = [
    {
      key: 'frontend',
      title: '프론트엔드',
      icon: 'ri-computer-line',
      placeholder: 'React, Vue, Angular...',
      examples: ['React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Sass', 'Next.js', 'Nuxt.js']
    },
    {
      key: 'backend',
      title: '백엔드',
      icon: 'ri-server-line',
      placeholder: 'Node.js, Python, Java...',
      examples: ['Node.js', 'Python', 'Java', 'Spring', 'Django', 'Express', 'MySQL', 'PostgreSQL', 'MongoDB']
    },
    {
      key: 'design',
      title: '디자인 툴',
      icon: 'ri-palette-line',
      placeholder: 'Figma, Photoshop, Sketch...',
      examples: ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InDesign', 'Principle', 'Framer']
    },
    {
      key: 'collaboration',
      title: '협업 툴',
      icon: 'ri-team-line',
      placeholder: 'Git, Slack, Jira...',
      examples: ['Git', 'GitHub', 'GitLab', 'Slack', 'Jira', 'Trello', 'Notion', 'Confluence']
    },
    {
      key: 'other',
      title: '기타',
      icon: 'ri-tools-line',
      placeholder: '기타 기술이나 도구...',
      examples: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Webpack', 'Vite', 'GraphQL', 'REST API']
    }
  ];

  const addSkill = (category: string, skill: string) => {
    if (skill.trim() && !data[category as keyof Skills].includes(skill.trim())) {
      const updatedData = {
        ...data,
        [category]: [...data[category as keyof Skills], skill.trim()]
      };
      onUpdate(updatedData);
      setCurrentInput({
        ...currentInput,
        [category]: ''
      });
    }
  };

  const removeSkill = (category: string, index: number) => {
    const updatedData = {
      ...data,
      [category]: data[category as keyof Skills].filter((_, i) => i !== index)
    };
    onUpdate(updatedData);
  };

  const handleKeyPress = (e: React.KeyboardEvent, category: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(category, currentInput[category]);
    }
  };

  const addExampleSkill = (category: string, skill: string) => {
    addSkill(category, skill);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E2022] mb-2">기술 스택</h2>
        <p className="text-[#52616B]">보유한 기술과 도구들을 카테고리별로 정리해주세요</p>
      </div>

      <div className="space-y-8">
        {skillCategories.map((category) => (
          <div key={category.key} className="border border-[#E1E4E6] rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[#34373b] rounded-lg flex items-center justify-center">
                <i className={`${category.icon} text-[#F0F5F9] w-5 h-5 flex items-center justify-center`}></i>
              </div>
              <h3 className="text-lg font-semibold text-[#1E2022]">{category.title}</h3>
            </div>

            {/* 입력 필드 */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={currentInput[category.key]}
                  onChange={(e) => setCurrentInput({
                    ...currentInput,
                    [category.key]: e.target.value
                  })}
                  onKeyPress={(e) => handleKeyPress(e, category.key)}
                  placeholder={category.placeholder}
                  className="flex-1 px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
                />
                <button
                  onClick={() => addSkill(category.key, currentInput[category.key])}
                  className="px-4 py-3 bg-[#34373b] text-[#F0F5F9] rounded-lg hover:bg-[#52616B] transition-colors cursor-pointer whitespace-nowrap"
                >
                  추가
                </button>
              </div>
              <p className="text-xs text-[#52616B] mt-1">
                기술명을 입력하고 Enter를 누르거나 추가 버튼을 클릭하세요
              </p>
            </div>

            {/* 추가된 스킬 태그 */}
            {data[category.key as keyof Skills].length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {data[category.key as keyof Skills].map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-2 bg-[#34373b] text-[#F0F5F9] px-3 py-1 rounded-full text-sm"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(category.key, index)}
                        className="hover:text-red-300 transition-colors"
                      >
                        <i className="ri-close-line w-4 h-4 flex items-center justify-center"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 예시 스킬 */}
            <div>
              <p className="text-sm text-[#52616B] mb-2">자주 사용되는 {category.title} 기술:</p>
              <div className="flex flex-wrap gap-2">
                {category.examples.filter(skill => !data[category.key as keyof Skills].includes(skill)).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => addExampleSkill(category.key, skill)}
                    className="px-3 py-1 bg-[#F0F5F9] text-[#52616B] rounded-full text-sm hover:bg-[#E1E4E6] transition-colors cursor-pointer border border-[#E1E4E6]"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#F0F5F9] border border-[#E1E4E6] rounded-lg p-6 mt-8">
        <div className="flex items-start space-x-3">
          <i className="ri-lightbulb-line text-[#52616B] w-5 h-5 flex items-center justify-center mt-1"></i>
          <div>
            <h4 className="font-medium text-[#1E2022] mb-2">💡 기술 스택 작성 팁</h4>
            <ul className="text-sm text-[#52616B] space-y-1">
              <li>• 실무에서 사용해본 기술만 포함하세요</li>
              <li>• 숙련도가 높은 기술을 먼저 배치하세요</li>
              <li>• 최신 기술 트렌드를 반영하되, 과장하지 마세요</li>
              <li>• 프로젝트에서 실제 사용한 기술을 우선적으로 작성하세요</li>
            </ul>
          </div>
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
          다음 단계로
        </button>
      </div>
    </div>
  );
}
