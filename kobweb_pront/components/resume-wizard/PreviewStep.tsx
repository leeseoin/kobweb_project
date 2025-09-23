
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ResumeData } from '../../app/create-resume/page';

interface PreviewStepProps {
  data: ResumeData;
  onPrevious: () => void;
}

export default function PreviewStep({ data, onPrevious }: PreviewStepProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    // 실제 발행 로직 구현
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPublishing(false);
    setIsPublished(true);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const getSocialIcon = (platform: string) => {
    const icons = {
      github: 'ri-github-line',
      linkedin: 'ri-linkedin-line',
      website: 'ri-global-line',
      behance: 'ri-behance-line',
      dribbble: 'ri-dribbble-line'
    };
    return icons[platform as keyof typeof icons] || 'ri-link';
  };

  const getSocialLabel = (platform: string) => {
    const labels = {
      github: 'GitHub',
      linkedin: 'LinkedIn',
      website: 'Website',
      behance: 'Behance',
      dribbble: 'Dribbble'
    };
    return labels[platform as keyof typeof labels] || platform;
  };

  if (isPublished) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-3xl text-green-600 w-8 h-8 flex items-center justify-center"></i>
          </div>
          <h2 className="text-2xl font-bold text-[#1E2022] mb-2">이력서가 성공적으로 발행되었습니다!</h2>
          <p className="text-[#52616B]">이제 다른 사용자들이 당신의 이력서를 확인할 수 있습니다</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/resume-hub"
            className="w-full bg-[#34373b] text-[#F0F5F9] px-6 py-3 rounded-lg hover:bg-[#52616B] transition-colors cursor-pointer whitespace-nowrap font-medium inline-block"
          >
            이력서 허브에서 확인하기
          </Link>
          <Link
            href="/"
            className="w-full bg-[#E1E4E6] text-[#1E2022] px-6 py-3 rounded-lg hover:bg-[#C9D6DF] transition-colors cursor-pointer whitespace-nowrap font-medium inline-block"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E2022] mb-2">미리보기 및 발행</h2>
        <p className="text-[#52616B]">완성된 이력서를 확인하고 발행해보세요</p>
      </div>

      <div className="flex gap-8">
        {/* 이력서 미리보기 */}
        <div className="flex-1">
          <div className="bg-white border border-[#E1E4E6] rounded-lg p-8 shadow-sm">
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#C9D6DF] flex-shrink-0">
                  {data.basicInfo.profileImage ? (
                    <img
                      src={data.basicInfo.profileImage}
                      alt={data.basicInfo.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="ri-user-line text-3xl text-[#52616B] w-8 h-8 flex items-center justify-center"></i>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#1E2022] mb-2">{data.basicInfo.name}</h1>
                  <p className="text-xl text-[#52616B] font-medium mb-2">{data.basicInfo.position}</p>
                  {data.basicInfo.tagline && (
                    <p className="text-[#52616B] mb-4">{data.basicInfo.tagline}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-[#52616B]">
                    <div className="flex items-center space-x-1">
                      <i className="ri-mail-line w-4 h-4 flex items-center justify-center"></i>
                      <span>{data.basicInfo.email}</span>
                    </div>
                    {data.basicInfo.phone && (
                      <div className="flex items-center space-x-1">
                        <i className="ri-phone-line w-4 h-4 flex items-center justify-center"></i>
                        <span>{data.basicInfo.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 소셜 링크 */}
            {Object.entries(data.basicInfo.links).some(([_, value]) => value) && (
              <div className="border-t border-[#E1E4E6] pt-6 mb-8">
                <div className="flex items-center space-x-4">
                  {Object.entries(data.basicInfo.links).map(([platform, url]) => 
                    url && (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-[#52616B] hover:text-[#1E2022] transition-colors"
                      >
                        <i className={`${getSocialIcon(platform)} w-5 h-5 flex items-center justify-center`}></i>
                        <span className="text-sm">{getSocialLabel(platform)}</span>
                      </a>
                    )
                  )}
                </div>
              </div>
            )}

            {/* 기술 스택 */}
            {Object.values(data.skills).some(skillArray => skillArray.length > 0) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#1E2022] mb-4">Skills</h2>
                <div className="space-y-4">
                  {Object.entries(data.skills).map(([category, skills]) => 
                    skills.length > 0 && (
                      <div key={category}>
                        <h3 className="text-lg font-semibold text-[#1E2022] mb-2 capitalize">{category}</h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-[#34373b] text-[#F0F5F9] px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* 프로젝트 */}
            {data.projects.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#1E2022] mb-4">Projects</h2>
                <div className="space-y-6">
                  {data.projects.map((project, index) => (
                    <div key={project.id} className="border border-[#E1E4E6] rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        {project.thumbnail && (
                          <div className="w-24 h-18 rounded-lg overflow-hidden bg-[#F0F5F9] flex-shrink-0">
                            <img
                              src={project.thumbnail}
                              alt={project.title}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#1E2022] mb-1">{project.title}</h3>
                          <p className="text-sm text-[#52616B] mb-2">{project.duration}</p>
                          <p className="text-[#52616B] mb-3">{project.summary}</p>
                          <p className="text-[#52616B] mb-3">{project.contribution}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.technologies.map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="bg-[#E1E4E6] text-[#52616B] px-2 py-1 rounded-full text-xs"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4">
                            {Object.entries(project.links).map(([linkType, url]) => 
                              url && (
                                <a
                                  key={linkType}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#34373b] hover:text-[#52616B] text-sm"
                                >
                                  {linkType === 'demo' ? '데모' : linkType === 'github' ? 'GitHub' : linkType}
                                </a>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 경력 */}
            {data.experience.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#1E2022] mb-4">Experience</h2>
                <div className="space-y-6">
                  {data.experience.map((exp, index) => (
                    <div key={exp.id}>
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-[#34373b] rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-briefcase-line w-6 h-6 text-[#F0F5F9] flex items-center justify-center"></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-[#1E2022] mb-1">{exp.position}</h3>
                          <p className="text-lg text-[#52616B] font-medium mb-2">{exp.company}</p>
                          <p className="text-sm text-[#52616B] mb-3">
                            {exp.startDate} ~ {exp.isCurrentJob ? '현재' : exp.endDate}
                          </p>
                          <ul className="space-y-1">
                            {exp.achievements.map((achievement, achIndex) => (
                              <li key={achIndex} className="text-[#52616B] text-sm">
                                • {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {index < data.experience.length - 1 && (
                        <hr className="border-t border-[#E1E4E6] my-6" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 학력 */}
            {data.education.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#1E2022] mb-4">Education</h2>
                <div className="space-y-4">
                  {data.education.map((edu, index) => (
                    <div key={edu.id} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-[#34373b] rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-graduation-cap-line w-6 h-6 text-[#F0F5F9] flex items-center justify-center"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#1E2022] mb-1">{edu.degree}</h3>
                        <p className="text-[#52616B] mb-1">{edu.school} - {edu.major}</p>
                        <p className="text-sm text-[#52616B]">{edu.startDate} ~ {edu.endDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 추가 정보 */}
            {(data.additional.awards.length > 0 || data.additional.certifications.length > 0 || data.additional.courses.length > 0) && (
              <div>
                <h2 className="text-2xl font-bold text-[#1E2022] mb-4">Additional Information</h2>
                <div className="space-y-4">
                  {data.additional.awards.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#1E2022] mb-2">Awards</h3>
                      <ul className="space-y-1">
                        {data.additional.awards.map((award, index) => (
                          <li key={index} className="text-[#52616B] text-sm">• {award}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {data.additional.certifications.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#1E2022] mb-2">Certifications</h3>
                      <ul className="space-y-1">
                        {data.additional.certifications.map((cert, index) => (
                          <li key={index} className="text-[#52616B] text-sm">• {cert}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {data.additional.courses.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#1E2022] mb-2">Courses</h3>
                      <ul className="space-y-1">
                        {data.additional.courses.map((course, index) => (
                          <li key={index} className="text-[#52616B] text-sm">• {course}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 사이드바 */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white border border-[#E1E4E6] rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-[#1E2022] mb-6">발행 옵션</h3>
            
            <div className="space-y-4 mb-6">
              <button
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center space-x-2 bg-[#E1E4E6] text-[#1E2022] px-4 py-3 rounded-lg hover:bg-[#C9D6DF] transition-colors cursor-pointer whitespace-nowrap font-medium"
              >
                <i className="ri-download-line w-4 h-4 flex items-center justify-center"></i>
                <span>PDF 다운로드</span>
              </button>
              
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full flex items-center justify-center space-x-2 bg-[#34373b] text-[#F0F5F9] px-4 py-3 rounded-lg hover:bg-[#52616B] transition-colors cursor-pointer whitespace-nowrap font-medium disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <i className="ri-loader-4-line w-4 h-4 flex items-center justify-center animate-spin"></i>
                    <span>발행 중...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-upload-line w-4 h-4 flex items-center justify-center"></i>
                    <span>이력서 발행</span>
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-[#E1E4E6] pt-6">
              <h4 className="font-medium text-[#1E2022] mb-3">발행 후 혜택</h4>
              <ul className="space-y-2 text-sm text-[#52616B]">
                <li className="flex items-start space-x-2">
                  <i className="ri-check-line w-4 h-4 text-green-500 flex items-center justify-center mt-0.5"></i>
                  <span>이력서 허브에 공개</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="ri-check-line w-4 h-4 text-green-500 flex items-center justify-center mt-0.5"></i>
                  <span>채용 담당자 검색 가능</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="ri-check-line w-4 h-4 text-green-500 flex items-center justify-center mt-0.5"></i>
                  <span>네트워킹 기회 확대</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="ri-check-line w-4 h-4 text-green-500 flex items-center justify-center mt-0.5"></i>
                  <span>조회수 및 좋아요 확인</span>
                </li>
              </ul>
            </div>
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
      </div>
    </div>
  );
}
