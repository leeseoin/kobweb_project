
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
  const fallbackContacts = [
    {
      id: '1',
      name: 'Mark',
      title: 'Product Designer',
      company: 'Tech Company',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20young%20male%20product%20designer%20with%20clean%20background%2C%20corporate%20portrait%20style%2C%20confident%20smile%2C%20modern%20business%20attire&width=150&height=150&seq=mark-avatar&orientation=squarish',
      email: 'mark@company.com',
      github: 'github.com/mark',
      notion: 'notion.so/mark',
      skills: ['UI/UX Design', 'Product Strategy', 'User Research', 'Prototyping']
    },
    {
      id: '2',
      name: 'Sarah Chen',
      title: 'Frontend Developer',
      company: 'Tech Company',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20young%20female%20frontend%20developer%20with%20clean%20background%2C%20corporate%20portrait%20style%2C%20friendly%20smile%2C%20modern%20business%20attire&width=150&height=150&seq=sarah-avatar&orientation=squarish',
      email: 'sarah@techcorp.com',
      github: 'github.com/sarahchen',
      notion: 'notion.so/sarah',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS']
    },
    {
      id: '3',
      name: 'James Wilson',
      title: 'Product Manager',
      company: 'Startup',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20middle-aged%20male%20product%20manager%20with%20clean%20background%2C%20corporate%20portrait%20style%2C%20professional%20smile%2C%20business%20suit&width=150&height=150&seq=james-avatar&orientation=squarish',
      email: 'james@startup.io',
      github: 'github.com/jameswilson',
      notion: 'notion.so/james',
      skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Leadership']
    },
    {
      id: '4',
      name: 'Emily Rodriguez',
      title: 'UX Researcher',
      company: 'Design Agency',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20young%20female%20UX%20researcher%20with%20clean%20background%2C%20corporate%20portrait%20style%2C%20warm%20smile%2C%20modern%20professional%20attire&width=150&height=150&seq=emily-avatar&orientation=squarish',
      email: 'emily@design.co',
      github: 'github.com/emilyux',
      notion: 'notion.so/emily',
      skills: ['User Research', 'Data Analysis', 'Prototyping', 'Psychology']
    },
    {
      id: '5',
      name: 'Michael Chang',
      title: 'Backend Developer',
      company: 'Tech Company',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20young%20male%20backend%20developer%20with%20clean%20background%2C%20corporate%20portrait%20style%2C%20confident%20expression%2C%20casual%20business%20attire&width=150&height=150&seq=michael-avatar&orientation=squarish',
      email: 'michael@tech.com',
      github: 'github.com/michaelchang',
      notion: 'notion.so/michael',
      skills: ['Node.js', 'Python', 'AWS', 'Database Design']
    }
  ];

  // Use API data or fallback data
  const contactData = contacts || fallbackContacts;
  
  const filteredContacts = contactData.filter(contact => {
    const safeSearchTerm = searchTerm || '';

    // 검색어 필터 (position 또는 title 필드 모두 검색 대상)
    const contactTitle = contact.position || contact.title || '';
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
      <div className="flex-1 bg-white border border-[#bfc7d1] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#bfc7d1] flex items-center justify-between">
          <h3 className="text-[#1E2022] font-medium">연락처</h3>
        </div>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#34373b]"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 bg-white border border-[#bfc7d1] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#bfc7d1] flex items-center justify-between">
          <h3 className="text-[#1E2022] font-medium">연락처</h3>
          <button 
            onClick={refetch}
            className="text-sm text-[#34373b] hover:text-[#1E2022]"
          >
            다시 시도
          </button>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <i className="ri-error-warning-line w-8 h-8 text-red-500"></i>
          </div>
          <h4 className="text-[#1E2022] font-medium mb-2">연결 오류</h4>
          <p className="text-[#52616B] text-sm mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg transition-colors"
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
          <div className="w-16 h-16 bg-[#e1e4e6] rounded-full flex items-center justify-center mb-4">
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
            key={contact.businessCardId || contact.id}
            onClick={() => setSelectedContact(contact)}
            className={`p-4 border-b border-[#e1e4e6] cursor-pointer transition-colors hover:bg-[#e1e4e6] ${(selectedContact?.businessCardId || selectedContact?.id) === (contact.businessCardId || contact.id) ? 'bg-[#e1e4e6]' : ''}`}
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
                <p className="text-[#52616B] text-sm truncate">{contact.position || contact.title || '직책 미등록'}</p>
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
