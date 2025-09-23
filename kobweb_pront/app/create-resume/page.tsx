
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import BasicInfoStep from '../../components/resume-wizard/BasicInfoStep';
import ExperienceStep from '../../components/resume-wizard/ExperienceStep';
import SkillsStep from '../../components/resume-wizard/SkillsStep';
import ProjectsStep from '../../components/resume-wizard/ProjectsStep';
import EducationStep from '../../components/resume-wizard/EducationStep';
import PreviewStep from '../../components/resume-wizard/PreviewStep';

export interface ResumeData {
  basicInfo: {
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
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    isCurrentJob: boolean;
    achievements: string[];
  }>;
  skills: {
    frontend: string[];
    backend: string[];
    design: string[];
    collaboration: string[];
    other: string[];
  };
  projects: Array<{
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
  }>;
  education: Array<{
    id: string;
    school: string;
    major: string;
    startDate: string;
    endDate: string;
    degree: string;
  }>;
  additional: {
    awards: string[];
    certifications: string[];
    courses: string[];
  };
}

export default function CreateResumePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    basicInfo: {
      name: '',
      tagline: '',
      position: '',
      email: '',
      phone: '',
      profileImage: '',
      links: {
        github: '',
        linkedin: '',
        website: '',
        behance: '',
        dribbble: '',
      },
    },
    experience: [],
    skills: {
      frontend: [],
      backend: [],
      design: [],
      collaboration: [],
      other: [],
    },
    projects: [],
    education: [],
    additional: {
      awards: [],
      certifications: [],
      courses: [],
    },
  });

  const steps = [
    { number: 1, title: '기본 정보', subtitle: 'The Essentials' },
    { number: 2, title: '경력', subtitle: 'Your Journey' },
    { number: 3, title: '기술 스택', subtitle: 'Your Toolbox' },
    { number: 4, title: '프로젝트', subtitle: 'Your Proof' },
    { number: 5, title: '학력 및 기타', subtitle: 'Education & More' },
    { number: 6, title: '미리보기', subtitle: 'Preview & Finish' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('resumeDraft', JSON.stringify(resumeData));
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('이력서가 임시저장되었습니다.');
    } catch (error) {
      alert('임시저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateResumeData = (section: keyof ResumeData, data: any) => {
    setResumeData((prev) => ({ ...prev, [section]: data }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={resumeData.basicInfo}
            onUpdate={(data) => updateResumeData('basicInfo', data)}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <ExperienceStep
            data={resumeData.experience}
            onUpdate={(data) => updateResumeData('experience', data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <SkillsStep
            data={resumeData.skills}
            onUpdate={(data) => updateResumeData('skills', data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <ProjectsStep
            data={resumeData.projects}
            onUpdate={(data) => updateResumeData('projects', data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <EducationStep
            data={resumeData.education}
            additional={resumeData.additional}
            onUpdateEducation={(data) => updateResumeData('education', data)}
            onUpdateAdditional={(data) => updateResumeData('additional', data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 6:
        return (
          <PreviewStep
            data={resumeData}
            onPrevious={handlePrevious}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F5F9]">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1E2022] mb-2">이력서 만들기</h1>
              <p className="text-[#52616B]">단계별로 완성하는 나만의 전문 이력서</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="flex items-center space-x-2 bg-[#F0F5F9] hover:bg-[#E1E4E6] text-[#52616B] border border-[#C9D6DF] px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <i className="ri-loader-4-line w-4 h-4 flex items-center justify-center animate-spin"></i>
                    <span>저장 중...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-save-line w-4 h-4 flex items-center justify-center"></i>
                    <span>임시저장</span>
                  </>
                )}
              </button>
              <Link
                href="/"
                className="flex items-center space-x-2 bg-[#E1E4E6] hover:bg-[#C9D6DF] text-[#1E2022] px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
                <span>나가기</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* 단계 진행 상황 */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white border border-[#E1E4E6] rounded-lg p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#1E2022]">진행 상황</h3>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="text-[#52616B] hover:text-[#1E2022] transition-colors disabled:opacity-50"
                  title="임시저장"
                >
                  {isSaving ? (
                    <i className="ri-loader-4-line w-5 h-5 flex items-center justify-center animate-spin"></i>
                  ) : (
                    <i className="ri-save-line w-5 h-5 flex items-center justify-center"></i>
                  )}
                </button>
              </div>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.number}
                    onClick={() => handleStepClick(step.number)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      currentStep === step.number
                        ? 'bg-[#34373b] text-white'
                        : currentStep > step.number
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        currentStep === step.number
                          ? 'bg-white text-[#34373b]'
                          : currentStep > step.number
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <i className="ri-check-line w-4 h-4 flex items-center justify-center"></i>
                      ) : (
                        <span className="text-sm font-medium">{step.number}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs opacity-75">{step.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-[#E1E4E6]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#52616B]">전체 진행률</span>
                  <span className="text-sm font-medium text-[#1E2022]">
                    {Math.round((currentStep / steps.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#34373b] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="flex-1">
            <div className="bg-white border border-[#E1E4E6] rounded-lg p-8">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
