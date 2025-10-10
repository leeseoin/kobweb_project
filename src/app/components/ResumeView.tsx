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
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-300 rounded-xl p-6 max-w-7xl mx-auto w-full shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">이력서 관리</h2>
          <p className="text-slate-700 font-medium">이력서를 관리하고 공유하세요</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/create-resume"
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-md hover:shadow-lg font-semibold"
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
            className="w-full bg-white border-2 border-slate-400 rounded-lg px-4 py-2 pl-10 text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium shadow-sm"
          />
          <i className="ri-search-line absolute left-3 top-2.5 text-slate-600 w-4 h-4 flex items-center justify-center"></i>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border-2 border-slate-400 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer pr-8 font-medium shadow-sm"
        >
          <option value="All">전체 상태</option>
          <option value="Active">활성화</option>
          <option value="Draft">임시저장</option>
          <option value="Archived">보관됨</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResumes.map((resume) => (
          <div key={resume.id} className="bg-white border-2 border-slate-300 rounded-xl p-6 hover:shadow-2xl hover:border-blue-400 transition-all duration-200 cursor-pointer group">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 border-2 border-slate-300 shadow-md">
                <img
                  src={resume.avatar}
                  alt={resume.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-800 font-bold text-lg truncate">{resume.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(resume.status)}`}>
                    {getStatusLabel(resume.status)}
                  </span>
                </div>
                <p className="text-slate-700 text-sm font-semibold mb-2">
                  {resume.title}
                </p>
                <p className="text-slate-600 text-xs font-medium">
                  최종 수정: {new Date(resume.lastModified).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <i className="ri-eye-line w-4 h-4 text-slate-600 flex items-center justify-center"></i>
                  <span className="text-slate-700 text-sm font-semibold">{resume.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="ri-heart-line w-4 h-4 text-red-500 flex items-center justify-center"></i>
                  <span className="text-slate-700 text-sm font-semibold">{resume.likes}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href={`/resume/${resume.id}`}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap text-sm text-center font-semibold shadow-md hover:shadow-lg"
              >
                보기
              </Link>
              <button className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-sm font-semibold border-2 border-slate-300">
                수정
              </button>
              <button className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-2 rounded-lg transition-colors cursor-pointer border-2 border-slate-300">
                <i className="ri-share-line w-4 h-4 flex items-center justify-center"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredResumes.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-file-user-line text-4xl text-slate-600 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
          <h3 className="text-slate-800 font-bold text-lg mb-2">이력서가 없습니다</h3>
          <p className="text-slate-700 text-sm mb-4 font-medium">새로운 이력서를 만들어보세요</p>
          <Link
            href="/create-resume"
            className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg transition-all cursor-pointer whitespace-nowrap font-semibold shadow-md hover:shadow-lg"
          >
            첫 번째 이력서 만들기
          </Link>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border-2 border-slate-400 shadow-2xl">
            <h3 className="text-slate-800 text-xl font-black mb-4">새 이력서 만들기</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-800 text-sm font-bold mb-2">이름</label>
                <input
                  type="text"
                  placeholder="이름을 입력하세요"
                  className="w-full border-2 border-slate-400 rounded-lg px-4 py-2 text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-800 text-sm font-bold mb-2">직책</label>
                <input
                  type="text"
                  placeholder="직책을 입력하세요"
                  className="w-full border-2 border-slate-400 rounded-lg px-4 py-2 text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-800 text-sm font-bold mb-2">템플릿</label>
                <select className="w-full border-2 border-slate-400 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer pr-8 font-medium">
                  <option>기본 템플릿</option>
                  <option>모던 템플릿</option>
                  <option>창의적 템플릿</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-semibold border-2 border-slate-300"
              >
                취소
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap font-semibold shadow-md hover:shadow-lg"
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
