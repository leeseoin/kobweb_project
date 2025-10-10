import { NextRequest, NextResponse } from 'next/server';

// 임시 데이터 (실제로는 스프링 부트 API에서 가져옴)
let contacts = [
  {
    id: '1',
    name: 'Mark',
    title: 'Product Designer',
    avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20young%20male%20product%20designer%20with%20clean%20background%2C%20corporate%20portrait%20style%2C%20confident%20smile%2C%20modern%20business%20attire&width=150&height=150&seq=mark-avatar&orientation=squarish',
    email: 'mark@company.com',
    github: 'github.com/mark',
    notion: 'notion.so/mark',
    skills: ['UI/UX Design', 'Product Strategy', 'User Research', 'Prototyping'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Sarah Chen',
    title: 'Frontend Developer',
    avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20young%20female%20frontend%20developer%20with%20clean%20background%2C%20corporate%20portrait%20style%2C%20friendly%20smile%2C%20modern%20business%20attire&width=150&height=150&seq=sarah-avatar&orientation=squarish',
    email: 'sarah@techcorp.com',
    github: 'github.com/sarahchen',
    notion: 'notion.so/sarah',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'James Wilson',
    title: 'Product Manager',
    avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20middle-aged%20male%20product%20manager%20with%20clean%20background%2C%20corporate%20portrait%20style%2C%20professional%20smile%2C%20business%20suit&width=150&height=150&seq=james-avatar&orientation=squarish',
    email: 'james@startup.io',
    github: 'github.com/jameswilson',
    notion: 'notion.so/james',
    skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Leadership'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/contacts - 모든 연락처 조회
export async function GET() {
  try {
    // 실제 스프링 부트 API가 있는지 확인
    const springBootUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    try {
      const response = await fetch(`${springBootUrl}/contacts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.log('Spring Boot API not available, using fallback data');
    }
    
    // Fallback to local data
    return NextResponse.json({ 
      data: contacts, 
      message: 'Contacts retrieved successfully', 
      success: true 
    });
  } catch (error) {
    return NextResponse.json({ 
      data: null, 
      message: 'Failed to fetch contacts', 
      success: false 
    }, { status: 500 });
  }
}

// POST /api/contacts - 새 연락처 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newContact = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 실제 스프링 부트 API가 있는지 확인
    const springBootUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    try {
      const response = await fetch(`${springBootUrl}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.log('Spring Boot API not available, using fallback data');
    }
    
    // Fallback to local data
    contacts.push(newContact);
    return NextResponse.json({ 
      data: newContact, 
      message: 'Contact created successfully', 
      success: true 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      data: null, 
      message: 'Failed to create contact', 
      success: false 
    }, { status: 500 });
  }
}