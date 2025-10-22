
'use client';

import Link from 'next/link';
import { useContacts } from '../hooks/useApi';

interface Contact {
  businessCardId?: string;
  id?: string;
  name: string;
  position?: string;
  title?: string;
  avatar?: string;
  email: string;
  company?: string;
  github?: string;
  notion?: string;
  skills?: string[];
}

interface ContactListProps {
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact | null) => void;
  searchTerm: string;
  selectedDepartment?: string;
  connectionType?: string;
}

export default function ContactList({
  selectedContact,
  setSelectedContact,
  searchTerm = '',
  selectedDepartment = 'All Companies',
  connectionType = 'Connection Type'
}: ContactListProps) {
  const { data: contacts, loading, error, refetch } = useContacts();

  // Fallback data for development
  const fallbackContacts: Contact[] = [];

  // Use API data or fallback data
  const contactData = contacts || fallbackContacts;
  
  const filteredContacts = contactData.filter(contact => {
    const safeSearchTerm = searchTerm || '';

    // 검색어 필터 (position 또는 title 필드 모두 검색 대상)
    const contactTitle = (contact as any).position || (contact as any).title || '';
    const matchesSearch = contact.name.toLowerCase().includes(safeSearchTerm.toLowerCase()) ||
                         contactTitle.toLowerCase().includes(safeSearchTerm.toLowerCase());

    // 회사 필터
    const matchesCompany = selectedDepartment === 'All Companies' ||
                          contact.company === selectedDepartment;

    // 연결 타입 필터 (현재는 실제 데이터가 없으므로 항상 true)
    // 추후 contact에 connectionType 필드가 추가되면 활성화
    const matchesConnectionType = connectionType === 'Connection Type' || true;

    return matchesSearch && matchesCompany && matchesConnectionType;
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 bg-white border-2 border-slate-400 rounded-lg overflow-hidden shadow-md">
        <div className="p-4 border-b-2 border-slate-300 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100">
          <h3 className="text-[#1E2022] font-semibold">연락처</h3>
        </div>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-[#34373b]"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 bg-white border-2 border-slate-400 rounded-lg overflow-hidden shadow-md">
        <div className="p-4 border-b-2 border-slate-300 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100">
          <h3 className="text-[#1E2022] font-semibold">연락처</h3>
          <button
            onClick={refetch}
            className="text-sm text-[#34373b] hover:text-[#1E2022] font-medium"
          >
            다시 시도
          </button>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <i className="ri-error-warning-line w-8 h-8 text-red-600"></i>
          </div>
          <h4 className="text-[#1E2022] font-semibold mb-2">연결 오류</h4>
          <p className="text-slate-700 text-sm mb-4 font-medium">{error}</p>
          <button
            onClick={refetch}
            className="bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg transition-colors font-semibold shadow-md"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (filteredContacts.length === 0 && contactData.length === 0) {
    return (
      <div className="flex-1 bg-white border border-[#bfc7d1] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#bfc7d1] flex items-center justify-between">
          <h3 className="text-[#1E2022] font-medium">연락처 (0)</h3>
          <Link href="/add-contact" className="flex items-center space-x-2 bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-sm">
            <i className="ri-add-line w-4 h-4 flex items-center justify-center"></i>
            <span>새 명함 추가</span>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-slate-300 rounded-full flex items-center justify-center mb-4 shadow-lg border-2 border-slate-400">
            <i className="ri-contacts-line w-8 h-8 text-[#52616B] flex items-center justify-center"></i>
          </div>
          <h4 className="text-[#1E2022] font-medium mb-2">연락처가 없습니다</h4>
          <p className="text-[#52616B] text-sm mb-6 max-w-xs">첫 명함을 추가하여 당신의 네트워크를 만들어보세요!</p>
          <Link href="/add-contact" className="flex items-center space-x-2 bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-add-line w-4 h-4 flex items-center justify-center"></i>
            <span>새 명함 추가</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white border border-[#bfc7d1] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[#bfc7d1] flex items-center justify-between">
        <h3 className="text-[#1E2022] font-medium">연락처 ({filteredContacts.length})</h3>
        <Link href="/add-contact" className="flex items-center space-x-2 bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-sm">
          <i className="ri-add-line w-4 h-4 flex items-center justify-center"></i>
          <span>새 명함 추가</span>
        </Link>
      </div>

      <div className="overflow-y-auto max-h-96">
        {filteredContacts.map((contact) => (
          <div
            key={(contact as any).businessCardId || (contact as any).id}
            onClick={() => setSelectedContact(contact)}
            className={`p-4 border-b-2 border-slate-300 cursor-pointer transition-colors hover:bg-slate-200 ${((selectedContact as any)?.businessCardId || (selectedContact as any)?.id) === ((contact as any).businessCardId || (contact as any).id) ? 'bg-slate-200 shadow-inner' : ''}`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#bfc7d1] flex-shrink-0 flex items-center justify-center">
                {contact.avatar ? (
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <i className="ri-user-line text-[#52616B] text-xl"></i>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[#1E2022] font-medium truncate">{contact.name}</h4>
                <p className="text-[#52616B] text-sm truncate">{(contact as any).position || (contact as any).title || '직책 미등록'}</p>
                {contact.company && (
                  <p className="text-[#52616B] text-xs truncate">{contact.company}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
