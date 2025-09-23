
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

interface Resume {
  id: string;
  name: string;
  title: string;
  location: string;
  status: 'Looking' | 'Employed';
  likes: number;
  avatar: string;
  skills: string[];
  company?: string;
}

export default function ResumeHubPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedJobType, setSelectedJobType] = useState('All Roles');
  const [sortBy, setSortBy] = useState('Most Recent');

  const resumes: Resume[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      title: 'Senior Frontend Developer',
      location: 'San Francisco, CA',
      status: 'Employed',
      likes: 24,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20confident%20male%20senior%20frontend%20developer%20with%20clean%20background%2C%20modern%20business%20attire%2C%20friendly%20smile%2C%20tech%20professional%20style&width=120&height=120&seq=alex-resume&orientation=squarish',
      skills: ['React', 'TypeScript', 'Next.js'],
      company: 'Tech Corp'
    },
    {
      id: '2',
      name: 'Sarah Mitchell',
      title: 'UX/UI Designer',
      location: 'New York, NY',
      status: 'Looking',
      likes: 18,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20creative%20female%20UX%20UI%20designer%20with%20clean%20background%2C%20modern%20professional%20attire%2C%20confident%20smile%2C%20design%20professional%20style&width=120&height=120&seq=sarah-resume&orientation=squarish',
      skills: ['Figma', 'Adobe XD', 'Prototyping'],
      company: 'Design Studio'
    },
    {
      id: '3',
      name: 'Michael Chen',
      title: 'Full Stack Developer',
      location: 'Austin, TX',
      status: 'Employed',
      likes: 32,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20skilled%20male%20full%20stack%20developer%20with%20clean%20background%2C%20casual%20business%20attire%2C%20professional%20smile%2C%20software%20engineer%20style&width=120&height=120&seq=michael-resume&orientation=squarish',
      skills: ['Node.js', 'React', 'MongoDB'],
      company: 'Startup Inc'
    },
    {
      id: '4',
      name: 'Emma Rodriguez',
      title: 'Product Designer',
      location: 'Seattle, WA',
      status: 'Looking',
      likes: 15,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20creative%20female%20product%20designer%20with%20clean%20background%2C%20modern%20professional%20attire%2C%20warm%20smile%2C%20product%20design%20professional%20style&width=120&height=120&seq=emma-resume&orientation=squarish',
      skills: ['Sketch', 'Figma', 'User Research'],
      company: 'Design Co'
    },
    {
      id: '5',
      name: 'David Kim',
      title: 'Backend Engineer',
      location: 'Boston, MA',
      status: 'Employed',
      likes: 28,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20focused%20male%20backend%20engineer%20with%20clean%20background%2C%20business%20casual%20attire%2C%20confident%20expression%2C%20software%20developer%20style&width=120&height=120&seq=david-resume&orientation=squarish',
      skills: ['Python', 'Django', 'AWS'],
      company: 'Tech Solutions'
    },
    {
      id: '6',
      name: 'Lisa Wang',
      title: 'Mobile Developer',
      location: 'Chicago, IL',
      status: 'Looking',
      likes: 21,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20skilled%20female%20mobile%20developer%20with%20clean%20background%2C%20modern%20business%20attire%2C%20friendly%20smile%2C%20mobile%20app%20developer%20style&width=120&height=120&seq=lisa-resume&orientation=squarish',
      skills: ['React Native', 'Swift', 'Kotlin'],
      company: 'Mobile Tech'
    },
    {
      id: '7',
      name: 'James Wilson',
      title: 'DevOps Engineer',
      location: 'Portland, OR',
      status: 'Employed',
      likes: 19,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20technical%20male%20DevOps%20engineer%20with%20clean%20background%2C%20casual%20professional%20attire%2C%20confident%20smile%2C%20infrastructure%20specialist%20style&width=120&height=120&seq=james-resume&orientation=squarish',
      skills: ['Docker', 'Kubernetes', 'Jenkins'],
      company: 'Cloud Systems'
    },
    {
      id: '8',
      name: 'Sophie Taylor',
      title: 'Data Scientist',
      location: 'Denver, CO',
      status: 'Looking',
      likes: 26,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20analytical%20female%20data%20scientist%20with%20clean%20background%2C%20professional%20business%20attire%2C%20intelligent%20smile%2C%20data%20analytics%20professional%20style&width=120&height=120&seq=sophie-resume&orientation=squarish',
      skills: ['Python', 'Machine Learning', 'SQL'],
      company: 'Data Analytics'
    },
    {
      id: '9',
      name: 'Ryan Martinez',
      title: 'Cloud Architect',
      location: 'Miami, FL',
      status: 'Employed',
      likes: 30,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20strategic%20male%20cloud%20architect%20with%20clean%20background%2C%20formal%20business%20attire%2C%20professional%20smile%2C%20enterprise%20architect%20style&width=120&height=120&seq=ryan-resume&orientation=squarish',
      skills: ['AWS', 'Azure', 'Terraform'],
      company: 'Enterprise Solutions'
    },
    {
      id: '10',
      name: 'Rachel Green',
      title: 'System Administrator',
      location: 'Atlanta, GA',
      status: 'Looking',
      likes: 17,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20technical%20female%20system%20administrator%20with%20clean%20background%2C%20business%20casual%20attire%2C%20confident%20smile%2C%20IT%20professional%20style&width=120&height=120&seq=rachel-resume&orientation=squarish',
      skills: ['Linux', 'Network Security', 'Monitoring'],
      company: 'IT Services'
    },
    {
      id: '11',
      name: 'Kevin Lee',
      title: 'Security Engineer',
      location: 'Los Angeles, CA',
      status: 'Employed',
      likes: 23,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20security-focused%20male%20engineer%20with%20clean%20background%2C%20professional%20business%20attire%2C%20serious%20expression%2C%20cybersecurity%20specialist%20style&width=120&height=120&seq=kevin-resume&orientation=squarish',
      skills: ['Cybersecurity', 'Penetration Testing', 'CISSP'],
      company: 'Security Corp'
    },
    {
      id: '12',
      name: 'Amanda Foster',
      title: 'QA Engineer',
      location: 'Houston, TX',
      status: 'Looking',
      likes: 16,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20detail-oriented%20female%20QA%20engineer%20with%20clean%20background%2C%20professional%20attire%2C%20focused%20smile%2C%20quality%20assurance%20specialist%20style&width=120&height=120&seq=amanda-resume&orientation=squarish',
      skills: ['Test Automation', 'Selenium', 'Quality Assurance'],
      company: 'Quality Systems'
    }
  ];

  const filteredResumes = resumes.filter(resume => {
    const matchesSearch = resume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resume.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resume.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'All' || resume.status === selectedStatus;
    const matchesLocation = selectedLocation === 'All Locations' || resume.location.includes(selectedLocation.split(',')[0]);
    const matchesJobType = selectedJobType === 'All Roles' || resume.title.toLowerCase().includes(selectedJobType.toLowerCase());

    return matchesSearch && matchesStatus && matchesLocation && matchesJobType;
  });

  const sortedResumes = [...filteredResumes].sort((a, b) => {
    switch (sortBy) {
      case 'Most Likes':
        return b.likes - a.likes;
      case 'Alphabetical':
        return a.name.localeCompare(b.name);
      case 'Most Recent':
      default:
        return 0;
    }
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedLocation('All Locations');
    setSelectedJobType('All Roles');
    setSortBy('Most Recent');
  };

  return (
    <div className="min-h-screen bg-[#F0F5F9]">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1E2022] mb-2">Resume Hub</h1>
              <p className="text-[#52616B]">수백 명의 전문가들과 연결하고 완벽한 후보자를 찾아보세요</p>
            </div>
            <Link 
              href="/"
              className="flex items-center space-x-2 bg-[#E1E4E6] hover:bg-[#C9D6DF] text-[#1E2022] px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
              <span>돌아가기</span>
            </Link>
          </div>
        </div>

        <div className="bg-white border border-[#E1E4E6] rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className="block text-[#1E2022] mb-2 text-sm font-medium">검색</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="이름, 직책, 스킬로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 pl-10 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
                <i className="ri-search-line absolute left-3 top-3.5 text-[#52616B] w-4 h-4 flex items-center justify-center"></i>
              </div>
            </div>

            <div>
              <label className="block text-[#1E2022] mb-2 text-sm font-medium">구직 상태</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] focus:border-[#34373b] focus:outline-none cursor-pointer pr-8"
              >
                <option value="All">전체</option>
                <option value="Looking">구직 중</option>
                <option value="Employed">재직 중</option>
              </select>
            </div>

            <div>
              <label className="block text-[#1E2022] mb-2 text-sm font-medium">직군</label>
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] focus:border-[#34373b] focus:outline-none cursor-pointer pr-8"
              >
                <option value="All Roles">전체 직군</option>
                <option value="Frontend">프론트엔드</option>
                <option value="Backend">백엔드</option>
                <option value="Designer">디자이너</option>
                <option value="Data">데이터 사이언티스트</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#1E2022] mb-2 text-sm font-medium">지역</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] focus:border-[#34373b] focus:outline-none cursor-pointer pr-8"
              >
                <option value="All Locations">전체 지역</option>
                <option value="San Francisco">San Francisco, CA</option>
                <option value="New York">New York, NY</option>
                <option value="Austin">Austin, TX</option>
                <option value="Seattle">Seattle, WA</option>
                <option value="Boston">Boston, MA</option>
              </select>
            </div>

            <div>
              <label className="block text-[#1E2022] mb-2 text-sm font-medium">정렬</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white border border-[#C9D6DF] rounded-lg px-4 py-3 text-[#1E2022] focus:border-[#34373b] focus:outline-none cursor-pointer pr-8"
              >
                <option value="Most Recent">최신순</option>
                <option value="Most Likes">인기순</option>
                <option value="Alphabetical">이름순</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full bg-[#34373b] hover:bg-[#52616B] text-white px-4 py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-medium"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[#52616B]">
            {sortedResumes.length}개의 이력서를 찾았습니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedResumes.map((resume) => (
            <div key={resume.id} className="bg-white border border-[#E1E4E6] rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-105 hover:border-[#34373b]">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#C9D6DF] flex-shrink-0">
                  <img
                    src={resume.avatar}
                    alt={resume.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[#1E2022] font-semibold text-lg truncate">{resume.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${resume.status === 'Looking' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {resume.status === 'Looking' ? 'Looking' : 'Employed'}
                    </span>
                  </div>
                  <p className="text-[#52616B] text-sm font-medium mb-1">
                    {resume.title}
                  </p>
                  <div className="flex items-center space-x-1 mb-2">
                    <i className="ri-map-pin-line w-3 h-3 text-[#52616B] flex items-center justify-center"></i>
                    <p className="text-[#52616B] text-xs">
                      {resume.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {resume.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-[#E1E4E6] text-[#52616B] px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <i className="ri-heart-line w-4 h-4 text-red-500 flex items-center justify-center"></i>
                  <span className="text-[#52616B] text-sm">
                    {resume.likes} likes
                  </span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#34373b] hover:bg-[#52616B] text-white px-3 py-1 rounded-lg text-xs cursor-pointer whitespace-nowrap">
                  <Link href={`/resume/${resume.id}`} className="block">
                    View Profile →
                  </Link>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center space-x-2 mt-12">
          <button className="bg-white border border-[#E1E4E6] px-3 py-2 rounded-lg hover:bg-[#E1E4E6] transition-colors cursor-pointer disabled:opacity-50">
            <i className="ri-arrow-left-s-line w-4 h-4 flex items-center justify-center"></i>
          </button>
          
          {[1, 2, 3, 4].map((page) => (
            <button
              key={page}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${page === 1 ? 'bg-[#34373b] text-white' : 'bg-white border border-[#E1E4E6] hover:bg-[#E1E4E6] text-[#1E2022]'}`}
            >
              {page}
            </button>
          ))}
          
          <button className="bg-white border border-[#E1E4E6] px-3 py-2 rounded-lg hover:bg-[#E1E4E6] transition-colors cursor-pointer">
            <i className="ri-arrow-right-s-line w-4 h-4 flex items-center justify-center"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
