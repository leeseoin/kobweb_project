
'use client';

import { useState, useEffect, useMemo } from 'react';
import ContactList from './ContactList';
import ContactDetail from './ContactDetail';
import { useContacts } from '../hooks/useApi';

export default function ContactManager() {
  const { data: contacts } = useContacts();
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Companies');
  const [connectionType, setConnectionType] = useState('Connection Type');

  // 동적으로 회사 목록 생성
  const companyOptions = useMemo(() => {
    if (!contacts) return ['All Companies'];
    const companies = new Set(contacts.map(contact => contact.company).filter(Boolean));
    return ['All Companies', ...Array.from(companies).sort()];
  }, [contacts]);

  // 동적으로 연결 타입 목록 생성 (실제 데이터에 따라 조정 필요)
  const connectionOptions = useMemo(() => {
    return [
      'Connection Type',
      '직접 연결',
      '공통 지인을 통해',
      '행사에서 만남',
      '온라인으로 연결',
      '업무 관계'
    ];
  }, []);

  // 필터 초기화 함수
  const handleResetFilters = () => {
    setSelectedDepartment('All Companies');
    setConnectionType('Connection Type');
    setSearchTerm('');
  };

  return (
    <div className="h-full flex space-x-6">
      <div className="w-96 flex flex-col flex-shrink-0">
        <div className="mb-4 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="명함 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-slate-400 rounded-lg px-4 py-2 text-[#1E2022] placeholder-slate-600 focus:border-[#34373b] focus:outline-none text-sm font-medium"
            />
            <i className="ri-search-line absolute right-3 top-2.5 text-[#52616B] w-4 h-4 flex items-center justify-center"></i>
          </div>
          
          <div className="space-y-2">
            <div className="flex space-x-2">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="flex-1 bg-white border-2 border-slate-400 rounded-lg px-3 py-2 text-[#1E2022] text-sm font-medium focus:border-[#34373b] focus:outline-none cursor-pointer pr-8"
              >
                {companyOptions.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
              
              <select
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value)}
                className="flex-1 bg-white border-2 border-slate-400 rounded-lg px-3 py-2 text-[#1E2022] text-sm font-medium focus:border-[#34373b] focus:outline-none cursor-pointer pr-8"
              >
                {connectionOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleResetFilters}
              className="w-full bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              필터 초기화
            </button>
          </div>
        </div>
        
        <ContactList
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          searchTerm={searchTerm}
          selectedDepartment={selectedDepartment}
          connectionType={connectionType}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <ContactDetail
          contact={selectedContact}
          onContactUpdated={() => {
            setSelectedContact(null);
          }}
        />
      </div>
    </div>
  );
}