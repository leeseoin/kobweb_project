# 🗺️ Figma 마이그레이션 로드맵

## 🎯 작업 우선순위

### Phase 1: 기초 설정 (1-2일)
- [x] ✅ 스타일 추출 완료
- [x] ✅ 디자인 토큰 생성
- [ ] 🎨 Figma Variables 설정
- [ ] 📁 파일 구조 생성

### Phase 2: Core Components (3-5일)
- [ ] 🔵 Button (Primary, Secondary, Outline)
- [ ] 📝 Input Field (Default, Error, Focus)
- [ ] 🏷️ Typography Styles
- [ ] 🎨 Color Palette
- [ ] 📐 Spacing System

### Phase 3: Layout Components (5-7일)
- [ ] 🎯 Header Component
- [ ] 🧭 Sidebar Component
- [ ] 📦 Card Components
- [ ] 📱 Modal/Dialog
- [ ] 🔔 Notification Component

### Phase 4: Complex Components (7-10일)
- [ ] 👤 Contact Card
- [ ] 📄 Resume Card
- [ ] ⚙️ Settings Panel
- [ ] 💬 Message Interface
- [ ] 🔗 Network View

### Phase 5: Page Templates (10-14일)
- [ ] 🏠 Landing Page
- [ ] 🔑 Login/Signup Pages
- [ ] 📊 Dashboard Layout
- [ ] 📋 Contact Management
- [ ] 📄 Resume Views

## 📊 컴포넌트별 복잡도 분석

### 🟢 Simple (1-2시간)
- **Button**: 3가지 variant
- **Input**: 기본 스타일 + 상태
- **Avatar**: 원형 이미지 + placeholder
- **Badge**: 상태 표시용

### 🟡 Medium (3-5시간)
- **Header**: 네비게이션 + 사용자 메뉴
- **Sidebar**: 메뉴 리스트 + 활성 상태
- **Card**: 여러 variant + 그림자
- **Form Group**: 라벨 + 입력 + 오류

### 🔴 Complex (1-2일)
- **Contact Card**: 이미지 + 정보 + 액션
- **Resume Card**: 복잡한 레이아웃
- **Dashboard**: 전체 레이아웃 + 반응형
- **Network View**: 인터랙티브 요소

## 🎨 Figma 작업 가이드

### 1. Variables 설정
```
Collection: "Kobweb Colors"
├── Primary/Main: #1E2022
├── Primary/Light: #34373b
├── Background/Main: #F0F5F9
├── Background/Surface: #e1e4e6
├── Text/Primary: #1E2022
└── Text/Secondary: #52616B
```

### 2. Component 생성 순서
1. **Typography** → Text Styles 정의
2. **Colors** → Color Styles 정의
3. **Atoms** → 가장 기본적인 요소
4. **Molecules** → Atoms를 조합
5. **Organisms** → 복합 컴포넌트
6. **Templates** → 페이지 레이아웃

### 3. 네이밍 규칙
```
Components/
├── Atom/Button/Primary
├── Atom/Button/Secondary
├── Molecule/FormGroup
├── Organism/Header
└── Template/DashboardLayout
```

## 📋 체크리스트

### 오늘 할 일
- [ ] Figma 파일 생성
- [ ] Variables 설정 (figma-variables.txt 참조)
- [ ] Typography Styles 정의
- [ ] 기본 Button 컴포넌트 생성

### 이번 주 목표
- [ ] 모든 Atom 컴포넌트 완성
- [ ] Header, Sidebar 컴포넌트 완성
- [ ] 첫 번째 페이지 템플릿 (Login) 완성

### 다음 주 목표
- [ ] 모든 주요 컴포넌트 완성
- [ ] Dashboard 레이아웃 완성
- [ ] 반응형 대응 완료

## 🛠️ 작업 팁

### Auto Layout 활용
- 모든 컴포넌트에 Auto Layout 적용
- 간격은 8px 단위로 통일
- Flex 속성으로 반응형 구현

### Component Properties
- Boolean: isActive, isDisabled
- Instance Swap: icon, image
- Text: label, placeholder

### Documentation
- 각 컴포넌트에 사용법 설명 추가
- Variant별 사용 사례 명시
- 개발자 handoff 정보 포함

## 🚀 다음 단계

**지금 바로 시작하세요:**

1. **Figma 열기** → 새 파일 생성 "Kobweb Design System"
2. **Variables 설정** → `figma-variables.txt` 내용 참조
3. **첫 번째 컴포넌트** → Button 만들기 시작
4. **진행 상황 공유** → 완성되면 스크린샷 공유

---

*이 로드맵을 따라 단계별로 진행하면 체계적인 디자인 시스템을 구축할 수 있습니다!*