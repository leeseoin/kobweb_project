'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Resume {
  id: string;
  name: string;
  title: string;
  status: 'Active' | 'Draft' | 'Archived';
  lastModified: string;
  views: number;
  likes: number;
  avatar: string;
}

export default function ResumeView() {
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const resumes: Resume[] = [
    {
      id: '1',
      name: '김철수',
      title: '프론트엔드 개발자',
      status: 'Active',
      lastModified: '2024-01-15',
      views: 156,
      likes: 24,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20Korean%20businessman%20headshot%20with%20clean%20background%2C%20modern%20business%20attire%2C%20confident%20smile%2C%20frontend%20developer%20style&width=80&height=80&seq=resume-user1&orientation=squarish'
    },
    {
      id: '2',
      name: '이영희',
      title: 'UX/UI 디자이너',
      status: 'Draft',
      lastModified: '2024-01-10',
      views: 89,
      likes: 12,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20Korean%20businesswoman%20headshot%20with%20clean%20background%2C%20creative%20professional%20attire%2C%20friendly%20smile%2C%20UX%20designer%20style&width=80&height=80&seq=resume-user2&orientation=squarish'
    },
    {
      id: '3',
      name: '박지민',
      title: '백엔드 개발자',
      status: 'Active',
      lastModified: '2024-01-08',
      views: 203,
      likes: 31,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20Korean%20businesswoman%20headshot%20with%20clean%20background%2C%20tech%20professional%20attire%2C%20confident%20smile%2C%20backend%20developer%20style&width=80&height=80&seq=resume-user3&orientation=squarish'
    }
  ];

  const filteredResumes = resumes.filter(resume => {
    const matchesSearch = resume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resume.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || resume.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-700';
      case 'Archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Active':
        return '활성화';
      case 'Draft':
        return '임시저장';
      case 'Archived':
        return '보관됨';
      default:
        return status;
    }
  };

  return (
    <div className="h-full bg-white border border-[#bfc7d1] rounded-lg p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1E2022] mb-2">이력서 관리</h2>
          <p className="text-[#52616B]">이력서를 관리하고 공유하세요</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/create-resume"
            className="flex items-center space-x-2 bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line w-4 h-4 flex items-center justify-center"></i>
            <span>새 이력서</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="이름이나 직책으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#bfc7d1] rounded-lg px-4 py-2 pl-10 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none text-sm"
          />
          <i className="ri-search-line absolute left-3 top-2.5 text-[#52616B] w-4 h-4 flex items-center justify-center"></i>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-[#bfc7d1] rounded-lg px-4 py-2 text-[#1E2022] focus:border-[#34373b] focus:outline-none cursor-pointer pr-8"
        >
          <option value="All">전체 상태</option>
          <option value="Active">활성화</option>
          <option value="Draft">임시저장</option>
          <option value="Archived">보관됨</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResumes.map((resume) => (
          <div key={resume.id} className="bg-[#F0F5F9] border border-[#bfc7d1] rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-[#C9D6DF] flex-shrink-0">
                <img
                  src={resume.avatar}
                  alt={resume.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[#1E2022] font-semibold text-lg truncate">{resume.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resume.status)}`}>
                    {getStatusLabel(resume.status)}
                  </span>
                </div>
                <p className="text-[#52616B] text-sm font-medium mb-2">
                  {resume.title}
                </p>
                <p className="text-[#52616B] text-xs">
                  최종 수정: {new Date(resume.lastModified).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <i className="ri-eye-line w-4 h-4 text-[#52616B] flex items-center justify-center"></i>
                  <span className="text-[#52616B] text-sm">{resume.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="ri-heart-line w-4 h-4 text-red-500 flex items-center justify-center"></i>
                  <span className="text-[#52616B] text-sm">{resume.likes}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href={`/resume/${resume.id}`}
                className="flex-1 bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-sm text-center"
              >
                보기
              </Link>
              <button className="bg-[#E1E4E6] hover:bg-[#C9D6DF] text-[#1E2022] px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-sm">
                수정
              </button>
              <button className="bg-[#E1E4E6] hover:bg-[#C9D6DF] text-[#1E2022] px-3 py-2 rounded-lg transition-colors cursor-pointer">
                <i className="ri-share-line w-4 h-4 flex items-center justify-center"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredResumes.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-file-user-line text-4xl text-[#52616B] mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
          <h3 className="text-[#1E2022] font-semibold text-lg mb-2">이력서가 없습니다</h3>
          <p className="text-[#52616B] text-sm mb-4">새로운 이력서를 만들어보세요</p>
          <Link
            href="/create-resume"
            className="bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-6 py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            첫 번째 이력서 만들기
          </Link>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-[#1E2022] text-xl font-bold mb-4">새 이력서 만들기</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[#1E2022] text-sm font-medium mb-2">이름</label>
                <input
                  type="text"
                  placeholder="이름을 입력하세요"
                  className="w-full border border-[#bfc7d1] rounded-lg px-4 py-2 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#1E2022] text-sm font-medium mb-2">직책</label>
                <input
                  type="text"
                  placeholder="직책을 입력하세요"
                  className="w-full border border-[#bfc7d1] rounded-lg px-4 py-2 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#1E2022] text-sm font-medium mb-2">템플릿</label>
                <select className="w-full border border-[#bfc7d1] rounded-lg px-4 py-2 text-[#1E2022] focus:border-[#34373b] focus:outline-none cursor-pointer pr-8">
                  <option>기본 템플릿</option>
                  <option>모던 템플릿</option>
                  <option>창의적 템플릿</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-[#E1E4E6] hover:bg-[#C9D6DF] text-[#1E2022] px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                취소
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
