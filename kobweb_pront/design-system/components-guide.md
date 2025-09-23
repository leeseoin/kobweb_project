# 🎨 Kobweb 컴포넌트 스타일 가이드

## 📋 목차
- [페이지 구조](#페이지-구조)
- [컴포넌트 분류](#컴포넌트-분류)
- [디자인 패턴](#디자인-패턴)
- [Figma 마이그레이션 가이드](#figma-마이그레이션-가이드)

---

## 📱 페이지 구조

### 1. **홈페이지** (`/`)
```
📄 Layout Structure:
├── 🎯 Hero Section
│   ├── 배경: #F0F5F9
│   ├── 제목: 5xl, bold, #1E2022
│   ├── CTA 버튼: #1E2022 배경, #F0F5F9 텍스트
│   └── Outline 버튼: transparent 배경, #bfc7d1 테두리
├── ✨ Features Section
│   ├── 배경: #C9D6DF
│   ├── 아이콘 컨테이너: #34373b 배경, 원형
│   └── 설명 텍스트: #52616B
├── 💬 Testimonials Section
│   ├── 배경: #F0F5F9
│   ├── 카드: #e1e4e6 배경, rounded-lg
│   └── 프로필 이미지: 원형, 48x48px
└── 🚀 CTA Section
    ├── 배경: #C9D6DF
    └── 버튼: #1E2022 배경
```

### 2. **인증 페이지** (`/login`, `/signup`)
```
📄 Layout Structure:
├── 📦 Container
│   ├── 배경: #F0F5F9 (전체)
│   ├── 카드: #e1e4e6 배경, rounded-2xl, shadow-lg
│   └── 폼 요소들
├── 📝 Form Elements
│   ├── Input: #F0F5F9 배경, #bfc7d1 테두리
│   ├── Button: #1E2022 배경, hover:opacity-90
│   └── 링크: #1E2022 색상, hover:opacity-80
├── 🔗 Social Login
│   ├── Google: #F0F5F9 배경, #bfc7d1 테두리
│   └── GitHub: #34373b 배경, #F0F5F9 텍스트
└── 💡 Status Messages
    ├── 성공: #d1fae5 배경, #065f46 텍스트
    └── 오류: #fee2e2 배경, #dc2626 텍스트
```

### 3. **대시보드** (`/dashboard`)
```
📄 Layout Structure:
├── 🎯 Header (고정)
│   ├── 배경: #1E2022
│   ├── 로고 영역: gradient from-blue-500 to-purple-600
│   └── 사용자 메뉴: hover 시 dropdown
├── 🧭 Sidebar (고정 너비: 256px)
│   ├── 배경: #C9D6DF
│   ├── 메뉴 아이템:
│   │   ├── 활성: #34373b 배경, #F0F5F9 텍스트
│   │   └── 비활성: #52616B 텍스트, hover:#F0F5F9
│   └── 알림 배지: red-500 배경, 원형
└── 📊 Main Content
    ├── 배경: #F0F5F9
    ├── 패딩: 24px
    └── 동적 뷰 컴포넌트들
```

---

## 🧩 컴포넌트 분류

### **Navigation Components**
1. **Header**
   - 색상: #1E2022 배경, #F0F5F9 텍스트
   - 높이: 80px
   - 그라데이션 로고: blue-500 → purple-600

2. **Sidebar**
   - 너비: 256px (고정)
   - 배경: #C9D6DF
   - 메뉴 아이템 간격: 8px

### **Form Components**
1. **Input Fields**
   ```css
   background: #F0F5F9
   border: 1px solid #bfc7d1
   border-radius: 8px
   padding: 12px 16px
   focus:ring-2 ring-#34373b
   ```

2. **Buttons**
   ```css
   /* Primary */
   background: #1E2022
   color: #F0F5F9
   hover:opacity-90

   /* Secondary */
   background: #e1e4e6
   color: #1E2022
   border: 1px solid #bfc7d1
   hover:background: #C9D6DF
   ```

### **Card Components**
1. **Basic Card**
   ```css
   background: white
   border: 1px solid #E1E4E6
   border-radius: 8px
   box-shadow: 0 1px 2px rgba(0,0,0,0.05)
   ```

2. **Elevated Card**
   ```css
   background: #e1e4e6
   border-radius: 16px
   box-shadow: 0 10px 15px rgba(0,0,0,0.1)
   ```

---

## 🎨 디자인 패턴

### **Color Usage Patterns**
1. **Primary Actions**: `#1E2022` → `#34373b` (hover)
2. **Secondary Actions**: `#e1e4e6` → `#C9D6DF` (hover)
3. **Background Hierarchy**: `#F0F5F9` > `#e1e4e6` > `#C9D6DF`
4. **Text Hierarchy**: `#1E2022` > `#52616B` > `#788189`

### **Spacing Patterns**
- **Small gaps**: 8px (space-y-2)
- **Medium gaps**: 16px (space-y-4)
- **Large gaps**: 24px (space-y-6)
- **Section gaps**: 32px (space-y-8)

### **Border Radius Patterns**
- **Small elements**: 6px (rounded-md)
- **Cards**: 8px (rounded-lg)
- **Modals**: 16px (rounded-2xl)
- **Buttons**: 8px (rounded-lg)
- **Avatars**: 9999px (rounded-full)

---

## 🚀 Figma 마이그레이션 가이드

### **1단계: 디자인 토큰 설정**

```javascript
// Figma Variables 설정용
const figmaVariables = {
  "Primary/Main": "#1E2022",
  "Primary/Light": "#34373b",
  "Background/Main": "#F0F5F9",
  "Background/Surface": "#e1e4e6",
  "Background/Sidebar": "#C9D6DF",
  "Text/Primary": "#1E2022",
  "Text/Secondary": "#52616B",
  "Border/Main": "#bfc7d1"
};
```

### **2단계: 컴포넌트 라이브러리 생성**

#### **Atoms (원자 컴포넌트)**
- [ ] Button (Primary, Secondary, Outline)
- [ ] Input (Default, Error, Success)
- [ ] Icon (24x24, 16x16)
- [ ] Avatar (Small, Medium, Large)
- [ ] Badge (Status, Count)

#### **Molecules (분자 컴포넌트)**
- [ ] Search Bar
- [ ] Navigation Item
- [ ] Form Group (Label + Input + Error)
- [ ] Social Login Button
- [ ] Status Message

#### **Organisms (유기체 컴포넌트)**
- [ ] Header
- [ ] Sidebar
- [ ] Contact Card
- [ ] Resume Card
- [ ] Settings Panel

#### **Templates (템플릿)**
- [ ] Auth Layout (Login/Signup)
- [ ] Dashboard Layout
- [ ] Landing Page Layout

### **3단계: 페이지 디자인**

#### **우선순위별 페이지 작업 순서**
1. **🥇 High Priority**
   - Landing Page (`/`)
   - Login/Signup Pages
   - Dashboard Main

2. **🥈 Medium Priority**
   - Contact Management
   - Resume Views
   - Settings

3. **🥉 Low Priority**
   - Network Views
   - Messages
   - Notifications

### **4단계: 자동화 도구 활용**

#### **Figma 플러그인 추천**
- **Figma Tokens**: 디자인 토큰 동기화
- **Design System Manager**: 컴포넌트 버전 관리
- **Figma to CSS**: 스타일 코드 생성

#### **Export 설정**
```javascript
// 에셋 Export 규칙
const exportSettings = {
  icons: "SVG, 24x24",
  images: "PNG, 2x scale",
  components: "PNG + CSS code",
  spacing: "8px grid system"
};
```

---

## 📊 현재 프로젝트 통계

### **컴포넌트 수**
- 총 페이지: 10개
- 재사용 컴포넌트: 18개
- 고유 색상: 15개
- 폰트 크기: 9개

### **스타일 일관성**
- ✅ 색상 시스템: 잘 정의됨
- ✅ 간격 시스템: Tailwind 기반 일관성
- ✅ 타이포그래피: 3개 폰트 패밀리 사용
- ⚠️  그림자: 일부 인라인 스타일 혼재

### **개선 포인트**
1. 인라인 스타일 → CSS 변수 전환
2. 반복되는 스타일 → 재사용 컴포넌트화
3. 하드코딩된 색상 → 디자인 토큰 사용

---

*이 가이드는 코드베이스 분석을 통해 자동 생성되었습니다. Figma 작업 시 참조용으로 활용하세요.*