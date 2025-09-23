
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Experience {
  title: string;
  company: string;
  period: string;
  location: string;
  description: string;
}

interface Education {
  degree: string;
  school: string;
  period: string;
  location: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  link?: string;
}

interface Resume {
  id: string;
  name: string;
  title: string;
  location: string;
  status: 'Looking' | 'Employed';
  avatar: string;
  skills: string[];
  coreSkills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  links: {
    linkedin?: string;
    github?: string;
    website?: string;
    behance?: string;
  };
}

interface ResumeDetailProps {
  resumeId: string;
}

export default function ResumeDetail({ resumeId }: ResumeDetailProps) {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const resumeData: Record<string, Resume> = {
    '1': {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Senior Product Designer',
      location: 'San Francisco, CA',
      status: 'Looking',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20confident%20female%20senior%20product%20designer%20with%20clean%20background%2C%20modern%20business%20attire%2C%20friendly%20smile%2C%20creative%20professional%20style&width=120&height=120&seq=sarah-detail&orientation=squarish',
      coreSkills: ['UX/UI Design', 'Product Strategy', 'Team Leadership'],
      skills: ['Figma', 'Adobe Creative Suite', 'Sketch', 'Prototyping', 'User Research', 'Design Systems', 'Wireframing', 'Information Architecture', 'Usability Testing', 'Design Thinking'],
      experience: [
        {
          title: 'Senior Product Designer',
          company: 'Tech Corp',
          period: '2020 - Present',
          location: 'San Francisco, CA',
          description: 'Led the redesign of core products resulting in 40% increase in user engagement. Managed a team of 5 designers and collaborated with cross-functional teams to deliver user-centered design solutions.'
        },
        {
          title: 'Product Designer',
          company: 'Design Studio',
          period: '2018 - 2020',
          location: 'New York, NY',
          description: 'Collaborated with cross-functional teams to deliver user-centered design solutions. Conducted user research and created prototypes for mobile and web applications.'
        }
      ],
      education: [
        {
          degree: 'Master of Design',
          school: 'Design University',
          period: '2016 - 2018',
          location: 'Boston, MA'
        }
      ],
      projects: [
        {
          id: '1',
          title: 'E-commerce Mobile App Redesign',
          description: '사용자 경험을 개선하여 전환율을 35% 향상시킨 모바일 앱 리디자인 프로젝트',
          image: 'https://readdy.ai/api/search-image?query=Modern%20e-commerce%20mobile%20app%20interface%20design%20mockup%20with%20clean%20UI%2C%20product%20catalog%20screens%2C%20shopping%20cart%2C%20professional%20app%20design%20showcase&width=400&height=300&seq=project1&orientation=landscape',
          technologies: ['Figma', 'Prototyping', 'User Research'],
          link: 'https://behance.net/project1'
        },
        {
          id: '2',
          title: 'B2B Dashboard Design System',
          description: '일관된 사용자 경험을 위한 포괄적인 디자인 시스템 구축',
          image: 'https://readdy.ai/api/search-image?query=Professional%20B2B%20dashboard%20interface%20design%20with%20data%20visualization%2C%20charts%2C%20clean%20modern%20UI%20components%2C%20design%20system%20showcase&width=400&height=300&seq=project2&orientation=landscape',
          technologies: ['Design Systems', 'Component Library', 'Figma'],
          link: 'https://dribbble.com/project2'
        },
        {
          id: '3',
          title: 'Healthcare Platform UX Research',
          description: '의료진을 위한 플랫폼의 사용성 개선을 위한 포괄적인 UX 리서치',
          image: 'https://readdy.ai/api/search-image?query=Healthcare%20platform%20interface%20design%20with%20medical%20dashboard%2C%20patient%20management%20system%2C%20clean%20professional%20medical%20UI%20design&width=400&height=300&seq=project3&orientation=landscape',
          technologies: ['User Research', 'Usability Testing', 'Wireframing']
        }
      ],
      links: {
        linkedin: 'linkedin.com/in/sarahjohnson',
        github: 'github.com/sarahjohnson',
        website: 'sarahjohnson.design',
        behance: 'behance.net/sarahjohnson'
      }
    },
    '2': {
      id: '2',
      name: 'Alex Johnson',
      title: 'Senior Frontend Developer',
      location: 'San Francisco, CA',
      status: 'Employed',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20confident%20male%20senior%20frontend%20developer%20with%20clean%20background%2C%20modern%20business%20attire%2C%20friendly%20smile%2C%20tech%20professional%20style&width=120&height=120&seq=alex-detail&orientation=squarish',
      coreSkills: ['React', 'TypeScript', 'Next.js'],
      skills: ['JavaScript', 'React', 'TypeScript', 'Next.js', 'Node.js', 'GraphQL', 'REST API', 'Git', 'Docker', 'AWS'],
      experience: [
        {
          title: 'Senior Frontend Developer',
          company: 'Tech Corp',
          period: '2021 - Present',
          location: 'San Francisco, CA',
          description: 'Led frontend development for multiple high-traffic applications. Improved application performance by 50% and mentored junior developers.'
        }
      ],
      education: [
        {
          degree: 'Bachelor of Computer Science',
          school: 'Tech University',
          period: '2015 - 2019',
          location: 'California, CA'
        }
      ],
      projects: [
        {
          id: '1',
          title: 'React Component Library',
          description: '재사용 가능한 React 컴포넌트 라이브러리 구축',
          image: 'https://readdy.ai/api/search-image?query=React%20component%20library%20interface%20with%20code%20examples%2C%20UI%20components%20showcase%2C%20modern%20developer%20tools%20interface&width=400&height=300&seq=alex-project1&orientation=landscape',
          technologies: ['React', 'TypeScript', 'Storybook'],
          link: 'https://github.com/alex/components'
        }
      ],
      links: {
        linkedin: 'linkedin.com/in/alexjohnson',
        github: 'github.com/alexjohnson',
        website: 'alexjohnson.dev'
      }
    }
  };

  const resume = resumeData[resumeId];

  if (!resume) {
    return (
      <div className="min-h-screen bg-[#F0F5F9] text-[#1E2022] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">이력서를 찾을 수 없습니다</h1>
          <Link href="/resume-hub" className="text-[#52616B] hover:text-[#1E2022]">
            이력서 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F0F5F9] text-[#1E2022]">
      {/* Header */}
      <header className="bg-[#1E2022] border-b border-[#bfc7d1] px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link 
              href="/resume-hub"
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#34373b] transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line w-5 h-5 text-[#C9D6DF] flex items-center justify-center"></i>
            </Link>
            <h1 className="text-xl font-bold text-[#F0F5F9]">이력서 상세</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              <i className="ri-download-line w-4 h-4 flex items-center justify-center"></i>
              <span>PDF 저장</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-white border border-[#bfc7d1] rounded-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#bfc7d1] flex-shrink-0">
                <img
                  src={resume.avatar}
                  alt={resume.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <h1 className="text-[#1E2022] text-3xl font-bold mb-2">{resume.name}</h1>
                <p className="text-[#52616B] text-xl font-medium mb-4">
                  {resume.title}
                </p>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <i className="ri-map-pin-line w-4 h-4 text-gray-500 flex items-center justify-center"></i>
                    <span className="text-[#52616B] text-sm">
                      {resume.location}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    resume.status === 'Looking' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {resume.status === 'Looking' ? '구직 중' : '재직 중'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resume.coreSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-[#34373b] text-[#F0F5F9] px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <button className="bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-6 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-medium">
                <i className="ri-message-3-line w-4 h-4 mr-2 inline-flex items-center justify-center"></i>
                Message
              </button>
              <button className="bg-[#C9D6DF] hover:bg-[#bfc7d1] text-[#1E2022] px-6 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-medium border border-[#bfc7d1]">
                <i className="ri-user-add-line w-4 h-4 mr-2 inline-flex items-center justify-center"></i>
                Connect
              </button>
            </div>
          </div>

          {/* Links */}
          {Object.keys(resume.links).length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-4">
                {resume.links.linkedin && (
                  <a href={`https://${resume.links.linkedin}`} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center space-x-2 text-[#52616B] hover:text-[#1E2022] transition-colors">
                    <i className="ri-linkedin-fill w-5 h-5 flex items-center justify-center"></i>
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}
                {resume.links.github && (
                  <a href={`https://${resume.links.github}`} target="_blank" rel="noopener noreferrer"
                     className="flex items-center space-x-2 text-[#52616B] hover:text-[#1E2022] transition-colors">
                    <i className="ri-github-fill w-5 h-5 flex items-center justify-center"></i>
                    <span className="text-sm">GitHub</span>
                  </a>
                )}
                {resume.links.website && (
                  <a href={`https://${resume.links.website}`} target="_blank" rel="noopener noreferrer"
                     className="flex items-center space-x-2 text-[#52616B] hover:text-[#1E2022] transition-colors">
                    <i className="ri-global-line w-5 h-5 flex items-center justify-center"></i>
                    <span className="text-sm">Website</span>
                  </a>
                )}
                {resume.links.behance && (
                  <a href={`https://${resume.links.behance}`} target="_blank" rel="noopener noreferrer"
                     className="flex items-center space-x-2 text-[#52616B] hover:text-[#1E2022] transition-colors">
                    <i className="ri-behance-fill w-5 h-5 flex items-center justify-center"></i>
                    <span className="text-sm">Behance</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Portfolio/Projects Section */}
        {resume.projects.length > 0 && (
          <div className="bg-white border border-[#bfc7d1] rounded-lg p-6 mb-6">
            <h2 className="text-[#1E2022] text-2xl font-bold mb-6">Portfolio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resume.projects.map((project) => (
                <div key={project.id} className="bg-gray-50 rounded-lg p-4 border border-[#bfc7d1]">
                  <div className="w-full h-48 rounded-lg overflow-hidden mb-4 bg-gray-200">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <h3 className="text-[#1E2022] font-semibold text-lg mb-2">{project.title}</h3>
                  <p className="text-[#52616B] text-sm mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="bg-[#e1e4e6] text-[#52616B] px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-[#34373b] hover:text-[#1E2022] text-sm font-medium"
                    >
                      <span>프로젝트 보기</span>
                      <i className="ri-external-link-line w-4 h-4 flex items-center justify-center"></i>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Section */}
        <div className="bg-white border border-[#bfc7d1] rounded-lg p-6 mb-6">
          <h2 className="text-[#1E2022] text-2xl font-bold mb-6">Experience</h2>
          <div className="space-y-6">
            {resume.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#34373b] rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-briefcase-line w-6 h-6 text-[#F0F5F9] flex items-center justify-center"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[#1E2022] text-xl font-semibold mb-1">{exp.title}</h3>
                    <p className="text-[#52616B] text-lg font-medium mb-2">
                      {exp.company}
                    </p>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        <i className="ri-calendar-line w-4 h-4 text-gray-500 flex items-center justify-center"></i>
                        <span className="text-[#52616B] text-sm">
                          {exp.period}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="ri-map-pin-line w-4 h-4 text-gray-500 flex items-center justify-center"></i>
                        <span className="text-[#52616B] text-sm">
                          {exp.location}
                        </span>
                      </div>
                    </div>
                    <p className="text-[#52616B] leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
                {index < resume.experience.length - 1 && (
                  <hr className="border-t border-[#bfc7d1] my-6" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-white border border-[#bfc7d1] rounded-lg p-6 mb-6">
          <h2 className="text-[#1E2022] text-2xl font-bold mb-6">Education</h2>
          <div className="space-y-6">
            {resume.education.map((edu, index) => (
              <div key={index}>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#34373b] rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-graduation-cap-line w-6 h-6 text-[#F0F5F9] flex items-center justify-center"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[#1E2022] text-xl font-semibold mb-1">{edu.degree}</h3>
                    <p className="text-[#52616B] text-lg font-medium mb-2">
                      {edu.school}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <i className="ri-calendar-line w-4 h-4 text-gray-500 flex items-center justify-center"></i>
                        <span className="text-[#52616B] text-sm">
                          {edu.period}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="ri-map-pin-line w-4 h-4 text-gray-500 flex items-center justify-center"></i>
                        <span className="text-[#52616B] text-sm">
                          {edu.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {index < resume.education.length - 1 && (
                  <hr className="border-t border-[#bfc7d1] my-6" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white border border-[#bfc7d1] rounded-lg p-6">
          <h2 className="text-[#1E2022] text-2xl font-bold mb-6">Skills</h2>
          <div className="flex flex-wrap gap-3">
            {resume.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-[#e1e4e6] text-[#52616B] px-4 py-2 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
