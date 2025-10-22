# KobWeb - 명함 관리 및 인맥 네트워킹 플랫폼

KobWeb은 AI 기반 명함 인식과 인맥 관계 시각화를 제공하는 프로페셔널 네트워킹 플랫폼입니다.

## 📋 프로젝트 개요

- **프론트엔드**: Next.js 15.5.4 (App Router) + React 19 + TypeScript
- **스타일링**: Tailwind CSS 4
- **그래프 시각화**: D3.js + react-force-graph
- **실시간 통신**: WebSocket (STOMP.js + SockJS)
- **백엔드 연동**: Spring Boot API (8080 포트)
- **AI 서버**: Flask/FastAPI (4000 포트)

## 🚀 시작하기

### 개발 서버 실행

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ✅ 구현 완료된 기능

### 1. 프론트엔드 UI/UX
- ✅ 랜딩 페이지 (네트워크 그래프 시각화 포함)
- ✅ 대시보드 레이아웃 (Header, Sidebar)
- ✅ 반응형 디자인 (모바일/데스크톱)
- ✅ 드래그 가능한 AI 챗봇 버튼

### 2. 네트워크 시각화
- ✅ D3.js Force Graph 기반 인맥 관계도
- ✅ 노드 클릭/호버 인터랙션
- ✅ 상세 정보 팝업 (기술 스택, 프로젝트)
- ✅ 더미 데이터 기반 그래프 렌더링
- ✅ 줌/팬 인터랙션

### 3. 컴포넌트 구조
- ✅ ContactManager (명함 관리)
- ✅ NetworkView (네트워크 시각화)
- ✅ MessageView (채팅)
- ✅ NotificationView (알림)
- ✅ ResumeView (이력서)
- ✅ SettingsView (설정)
- ✅ BusinessCardEditor (명함 편집기)

### 4. API 클라이언트
- ✅ REST API 클라이언트 구현 (`src/app/lib/api.ts`)
- ✅ JWT 토큰 관리
- ✅ 에러 핸들링 및 사용자 친화적 메시지
- ✅ 타임아웃 처리
- ✅ Business Card CRUD API 정의
- ✅ User/Auth API 정의
- ✅ Chat API 정의
- ✅ Alarm API 정의
- ✅ Network API 정의

### 5. WebSocket 연결
- ✅ STOMP.js + SockJS 클라이언트 구현
- ✅ 자동 재연결 로직
- ✅ 채팅방 구독/발행 로직
- ✅ 실시간 메시지 수신 처리
- ✅ 연결 상태 관리 (connecting/connected/disconnected/error)

### 6. 커스텀 Hooks
- ✅ `useWebSocket` - WebSocket 연결 관리
- ✅ `useChatWebSocket` - 채팅 전용 WebSocket
- ✅ `useApi` - API 호출 관리
- ✅ `usePolling` - 폴링 로직

### 7. 이력서 기능
- ✅ Resume Wizard (다단계 폼)
  - BasicInfoStep (기본 정보)
  - ExperienceStep (경력)
  - EducationStep (학력)
  - ProjectsStep (프로젝트)
  - SkillsStep (기술)
  - PreviewStep (미리보기)

## ❌ 미완성/작동하지 않는 기능

### 1. 백엔드 연결 (필수)
- ❌ Spring Boot 백엔드 서버 없음 (8080 포트)
- ❌ 실제 데이터베이스 연동 필요
- ❌ JWT 인증 서버 필요

### 2. 실시간 채팅
- ❌ WebSocket 연결 성공하지만 백엔드 없어서 메시지 전송/수신 불가
- ❌ 채팅방 생성/조회 불가 (백엔드 필요)
- ❌ 읽음 처리, 타이핑 인디케이터 미구현

### 3. 명함 관리
- ❌ 실제 명함 데이터 저장/조회 불가 (백엔드 필요)
- ❌ 명함 스캔/OCR 기능 미구현
- ❌ 명함 공유 URL 생성 불가
- ❌ 명함 교환 요청 수락/거부 불가

### 4. 인증/로그인
- ❌ 회원가입/로그인 불가 (백엔드 없음)
- ❌ OAuth 소셜 로그인 미작동 (Google, GitHub)
- ❌ 비밀번호 재설정 미구현
- ❌ 프로필 수정 불가

### 5. AI 기능
- ❌ AI 서버 없음 (4000 포트)
- ❌ AI 어시스턴트 응답 불가
- ❌ 명함 OCR/자동 정보 추출 미구현
- ❌ 네트워크 추천 알고리즘 미구현

### 6. 알림 시스템
- ❌ 실시간 알림 수신 불가 (백엔드 필요)
- ❌ 알림 읽음 처리 불가
- ❌ 알림 타입별 필터링 미작동

### 7. 네트워크 기능
- ❌ 실제 네트워크 데이터 조회 불가 (현재 더미 데이터 사용)
- ❌ 친구 추가/삭제 불가
- ❌ 추천 연결 조회 불가
- ❌ 친구 요청 수락/거부 불가

### 8. 기타
- ❌ 파일 업로드 (프로필 이미지, 명함 이미지)
- ❌ 이메일 알림
- ❌ 검색 기능 (명함, 사용자)
- ❌ 페이지네이션
- ❌ 데이터 내보내기/가져오기

## 📦 의존성

### 주요 라이브러리
```json
{
  "dependencies": {
    "@stomp/stompjs": "^7.2.0",
    "d3": "^7.9.0",
    "next": "15.5.4",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-force-graph": "^1.48.1",
    "sockjs-client": "^1.6.1",
    "three": "^0.180.0"
  }
}
```

## 🏗️ 프로젝트 구조

```
src/
├── app/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── ContactManager.tsx
│   │   ├── NetworkView.tsx
│   │   ├── MessageView.tsx
│   │   ├── NotificationView.tsx
│   │   ├── ResumeView.tsx
│   │   ├── BusinessCardEditor.tsx
│   │   └── resume-wizard/   # 이력서 마법사 단계별 컴포넌트
│   ├── hooks/               # 커스텀 Hooks
│   │   ├── useWebSocket.ts
│   │   ├── useApi.ts
│   │   └── usePolling.ts
│   ├── lib/                 # 유틸리티 및 API
│   │   └── api.ts          # API 클라이언트
│   ├── dashboard/           # 대시보드 페이지
│   ├── login/               # 로그인 페이지
│   ├── signup/              # 회원가입 페이지
│   ├── create-resume/       # 이력서 생성 페이지
│   ├── resume-hub/          # 이력서 목록 페이지
│   └── page.tsx             # 랜딩 페이지
└── types/
    └── d3.d.ts              # D3.js 타입 정의
```

## 🔧 환경 변수

`.env.local` 파일 생성 필요:

```bash
# API 서버
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# AI 서버 (하드코딩됨: http://localhost:4000)

# WebSocket 서버 (하드코딩됨: http://localhost:8080/ws/chat)

# API 타임아웃
NEXT_PUBLIC_API_TIMEOUT=10000
```

## 📝 다음 단계 (TODO)

### 백엔드 개발 필요
1. Spring Boot 백엔드 서버 구축
   - User 인증/인가 (JWT)
   - Business Card CRUD
   - Chat 실시간 메시징 (WebSocket)
   - Alarm 알림 시스템
   - Network 관계 관리

2. AI 서버 구축
   - 명함 OCR (OCR.space API 또는 Tesseract)
   - 챗봇 응답 (OpenAI API 또는 로컬 LLM)
   - 네트워크 추천 알고리즘

3. 데이터베이스 설계
   - PostgreSQL 또는 MySQL
   - Redis (세션/캐시)

### 프론트엔드 개선
1. 에러 바운더리 추가
2. 로딩 스피너 개선
3. 오프라인 지원 (PWA)
4. 국제화 (i18n)
5. 다크모드

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License.

## 📞 문의

프로젝트 관련 문의: [이메일 주소]
