
'use client';

import { useState } from 'react';

interface Project {
  id: string;
  title: string;
  summary: string;
  duration: string;
  contribution: string;
  technologies: string[];
  thumbnail: string;
  links: {
    demo: string;
    github: string;
    presentation: string;
    blog: string;
  };
}

interface ProjectsStepProps {
  data: Project[];
  onUpdate: (data: Project[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function ProjectsStep({ data, onUpdate, onNext, onPrevious }: ProjectsStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [currentTech, setCurrentTech] = useState<{[key: string]: string}>({});

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: '',
      summary: '',
      duration: '',
      contribution: '',
      technologies: [],
      thumbnail: '',
      links: {
        demo: '',
        github: '',
        presentation: '',
        blog: ''
      }
    };
    onUpdate([...data, newProject]);
    setExpandedIndex(data.length);
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updatedData = [...data];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value
    };
    onUpdate(updatedData);
  };

  const updateProjectLink = (projectIndex: number, linkType: string, value: string) => {
    const updatedData = [...data];
    updatedData[projectIndex] = {
      ...updatedData[projectIndex],
      links: {
        ...updatedData[projectIndex].links,
        [linkType]: value
      }
    };
    onUpdate(updatedData);
  };

  const addTechnology = (projectIndex: number, tech: string) => {
    if (tech.trim() && !data[projectIndex].technologies.includes(tech.trim())) {
      const updatedData = [...data];
      updatedData[projectIndex].technologies.push(tech.trim());
      onUpdate(updatedData);
      setCurrentTech({
        ...currentTech,
        [projectIndex]: ''
      });
    }
  };

  const removeTechnology = (projectIndex: number, techIndex: number) => {
    const updatedData = [...data];
    updatedData[projectIndex].technologies.splice(techIndex, 1);
    onUpdate(updatedData);
  };

  const removeProject = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onUpdate(updatedData);
    setExpandedIndex(null);
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleImageUpload = (projectIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateProject(projectIndex, 'thumbnail', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const linkTypes = [
    { key: 'demo', label: '데모 URL', icon: 'ri-external-link-line', placeholder: 'https://your-demo.com' },
    { key: 'github', label: 'GitHub', icon: 'ri-github-line', placeholder: 'https://github.com/username/repo' },
    { key: 'presentation', label: '발표 자료', icon: 'ri-slideshow-line', placeholder: 'https://slides.com/your-presentation' },
    { key: 'blog', label: '회고/블로그', icon: 'ri-article-line', placeholder: 'https://blog.com/your-article' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E2022] mb-2">프로젝트 및 포트폴리오</h2>
        <p className="text-[#52616B]">역량을 증명할 수 있는 프로젝트와 결과물을 소개해주세요</p>
      </div>

      <div className="space-y-6">
        {data.map((project, index) => (
          <div key={project.id} className="border border-[#E1E4E6] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#34373b] rounded-lg flex items-center justify-center">
                  <i className="ri-folder-2-line text-[#F0F5F9] w-6 h-6 flex items-center justify-center"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E2022]">
                    {project.title || '프로젝트 제목'}
                  </h3>
                  <p className="text-sm text-[#52616B]">{project.duration || '기간'}</p>
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
                  onClick={() => removeProject(index)}
                  className="p-2 text-red-500 hover:text-red-600 transition-colors"
                >
                  <i className="ri-delete-bin-line w-5 h-5 flex items-center justify-center"></i>
                </button>
              </div>
            </div>

            {expandedIndex === index && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#52616B] mb-2">프로젝트 제목 *</label>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => updateProject(index, 'title', e.target.value)}
                      placeholder="프로젝트 이름을 입력하세요"
                      className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#52616B] mb-2">진행 기간</label>
                    <input
                      type="text"
                      value={project.duration}
                      onChange={(e) => updateProject(index, 'duration', e.target.value)}
                      placeholder="2024.01 ~ 2024.03 (3개월)"
                      className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#52616B] mb-2">프로젝트 썸네일</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 h-24 bg-[#F0F5F9] rounded-lg flex items-center justify-center overflow-hidden border border-[#E1E4E6]">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt="썸네일" className="w-full h-full object-cover object-top" />
                      ) : (
                        <i className="ri-image-line text-2xl text-[#52616B] w-8 h-8 flex items-center justify-center"></i>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id={`thumbnail-${index}`}
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                        className="hidden"
                      />
                      <label
                        htmlFor={`thumbnail-${index}`}
                        className="px-4 py-2 bg-[#34373b] text-[#F0F5F9] rounded-lg hover:bg-[#52616B] transition-colors cursor-pointer whitespace-nowrap inline-block"
                      >
                        이미지 업로드
                      </label>
                      <p className="text-xs text-[#52616B] mt-1">프로젝트 스크린샷이나 대표 이미지</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#52616B] mb-2">프로젝트 요약 *</label>
                  <textarea
                    value={project.summary}
                    onChange={(e) => updateProject(index, 'summary', e.target.value)}
                    placeholder="프로젝트의 목적, 해결한 문제, 결과를 간단히 설명하세요"
                    rows={3}
                    className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#52616B] mb-2">내가 기여한 부분 *</label>
                  <textarea
                    value={project.contribution}
                    onChange={(e) => updateProject(index, 'contribution', e.target.value)}
                    placeholder="팀 프로젝트라면 내가 담당한 부분을 구체적으로 설명하세요. 예: React와 TypeScript를 사용한 UI 개발 및 상태 관리 담당"
                    rows={3}
                    className="w-full px-4 py-3 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#52616B] mb-2">사용 기술</label>
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={currentTech[index] || ''}
                      onChange={(e) => setCurrentTech({
                        ...currentTech,
                        [index]: e.target.value
                      })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTechnology(index, currentTech[index] || '');
                        }
                      }}
                      placeholder="React, TypeScript, Node.js..."
                      className="flex-1 px-4 py-2 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent"
                    />
                    <button
                      onClick={() => addTechnology(index, currentTech[index] || '')}
                      className="px-4 py-2 bg-[#34373b] text-[#F0F5F9] rounded-lg hover:bg-[#52616B] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      추가
                    </button>
                  </div>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="inline-flex items-center space-x-2 bg-[#34373b] text-[#F0F5F9] px-3 py-1 rounded-full text-sm"
                        >
                          <span>{tech}</span>
                          <button
                            onClick={() => removeTechnology(index, techIndex)}
                            className="hover:text-red-300 transition-colors"
                          >
                            <i className="ri-close-line w-4 h-4 flex items-center justify-center"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#52616B] mb-4">관련 링크</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {linkTypes.map((linkType) => (
                      <div key={linkType.key} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#F0F5F9] rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className={`${linkType.icon} text-[#52616B] w-5 h-5 flex items-center justify-center`}></i>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-[#52616B] mb-1">{linkType.label}</label>
                          <input
                            type="url"
                            value={project.links[linkType.key as keyof typeof project.links]}
                            onChange={(e) => updateProjectLink(index, linkType.key, e.target.value)}
                            placeholder={linkType.placeholder}
                            className="w-full px-4 py-2 border border-[#C9D6DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34373b] focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addProject}
          className="w-full border-2 border-dashed border-[#C9D6DF] rounded-lg p-8 text-center hover:border-[#34373b] hover:bg-[#F0F5F9] transition-colors cursor-pointer"
        >
          <i className="ri-add-line text-2xl text-[#52616B] mb-2 w-6 h-6 flex items-center justify-center mx-auto"></i>
          <p className="text-[#52616B] font-medium">프로젝트 추가하기</p>
          <p className="text-sm text-[#52616B] mt-1">새로운 프로젝트를 추가해보세요</p>
        </button>
      </div>

      <div className="bg-[#F0F5F9] border border-[#E1E4E6] rounded-lg p-6 mt-8">
        <div className="flex items-start space-x-3">
          <i className="ri-lightbulb-line text-[#52616B] w-5 h-5 flex items-center justify-center mt-1"></i>
          <div>
            <h4 className="font-medium text-[#1E2022] mb-2">💡 프로젝트 작성 팁</h4>
            <ul className="text-sm text-[#52616B] space-y-1">
              <li>• 실제 결과물을 확인할 수 있는 링크를 반드시 포함하세요</li>
              <li>• 개인 프로젝트보다는 실무나 팀 프로젝트를 우선적으로 작성하세요</li>
              <li>• 기술적 도전과 해결 과정을 구체적으로 설명하세요</li>
              <li>• 프로젝트의 임팩트나 성과를 수치로 표현하면 더 효과적입니다</li>
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
