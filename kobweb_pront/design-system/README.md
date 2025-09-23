# 🎨 Kobweb Design System

자동으로 추출된 디자인 시스템과 Figma 마이그레이션 도구입니다.

## 📁 폴더 구조

```
design-system/
├── 📄 tokens.js              # 디자인 토큰 정의
├── 📄 components-guide.md     # 컴포넌트 스타일 가이드
├── 📄 style-analysis.json     # 자동 분석 결과 (생성됨)
└── 📄 README.md              # 이 파일
```

## 🚀 빠른 시작

### 1. 스타일 자동 추출

```bash
# 스크립트 실행 (프로젝트 루트에서)
node scripts/extract-styles.js
```

이 명령어는 다음을 수행합니다:
- 🎨 모든 컴포넌트에서 색상 추출
- 📏 스타일 패턴 분석
- 📊 사용 빈도 통계 생성
- 💡 개선 권장사항 제공

### 2. Tailwind 설정 업데이트

```bash
# 기존 설정을 백업하고 새 설정 적용
cp tailwind.config.js tailwind.config.backup.js
cp tailwind.config.updated.js tailwind.config.js
```

### 3. 디자인 토큰 사용

```javascript
// 컴포넌트에서 사용
import { designTokens } from '../design-system/tokens';

const Button = () => (
  <button
    className="bg-primary-main text-text-inverse hover:bg-primary-light"
    style={{ backgroundColor: designTokens.colors.primary.main }}
  >
    Click me
  </button>
);
```

## 🎯 추출된 디자인 토큰

### 주요 색상 팔레트

| 카테고리 | 색상 | Hex Code | 사용처 |
|----------|------|----------|--------|
| **Primary** | Main | `#1E2022` | 헤더, 주요 버튼 |
| **Primary** | Light | `#34373b` | Hover 상태, 액센트 |
| **Background** | Main | `#F0F5F9` | 페이지 배경 |
| **Background** | Surface | `#e1e4e6` | 카드 배경 |
| **Background** | Sidebar | `#C9D6DF` | 사이드바 배경 |
| **Text** | Primary | `#1E2022` | 제목, 중요 텍스트 |
| **Text** | Secondary | `#52616B` | 본문 텍스트 |
| **Border** | Main | `#bfc7d1` | 기본 테두리 |

### 타이포그래피

```css
/* 폰트 패밀리 */
font-family: 'Inter', sans-serif;          /* 기본 텍스트 */
font-family: 'JetBrains Mono', monospace;   /* 코드, 모노스페이스 */
font-family: 'Pacifico', cursive;          /* 로고, 장식용 */

/* 폰트 크기 */
font-size: 0.75rem;   /* xs - 12px */
font-size: 0.875rem;  /* sm - 14px */
font-size: 1rem;      /* base - 16px */
font-size: 1.25rem;   /* xl - 20px */
font-size: 2.25rem;   /* 4xl - 36px */
font-size: 3rem;      /* 5xl - 48px */
```

## 🛠️ Figma 마이그레이션 가이드

### 단계별 진행

#### 1단계: 디자인 토큰 설정
1. Figma에서 새 파일 생성
2. **Variables** 패널 열기
3. `design-system/tokens.js`의 색상을 Variables로 추가

```javascript
// Figma Variables 예시
Primary/Main = #1E2022
Primary/Light = #34373b
Background/Main = #F0F5F9
Text/Primary = #1E2022
// ... 계속
```

#### 2단계: 컴포넌트 라이브러리 생성
1. **Atoms** 생성 (버튼, 인풋, 아이콘)
2. **Molecules** 생성 (폼 그룹, 네비게이션 아이템)
3. **Organisms** 생성 (헤더, 사이드바, 카드)

#### 3단계: 페이지 템플릿 생성
1. **Auth Layout** (로그인/회원가입)
2. **Dashboard Layout** (메인 앱)
3. **Landing Page Layout** (홈페이지)

### 자동화 도구 활용

#### Figma 플러그인
- **Figma Tokens**: 디자인 토큰 동기화
- **Design System Manager**: 컴포넌트 관리
- **Component Inspector**: 스타일 분석

#### Export 설정
```json
{
  "icons": {
    "format": "SVG",
    "size": "24x24"
  },
  "images": {
    "format": "PNG",
    "scale": "2x"
  },
  "spacing": {
    "grid": "8px",
    "baseline": "4px"
  }
}
```

## 📊 분석 결과 예시

스크립트 실행 후 생성되는 `style-analysis.json`:

```json
{
  "summary": {
    "totalFiles": 18,
    "totalColors": 15,
    "totalClasses": 247
  },
  "colorAnalysis": {
    "topColors": [
      ["#1E2022", 45],
      ["#F0F5F9", 38],
      ["#34373b", 23]
    ]
  },
  "recommendations": [
    {
      "type": "warning",
      "message": "15개의 색상이 사용되고 있습니다. 디자인 시스템 통합을 고려해보세요."
    }
  ]
}
```

## 🎯 다음 단계

### 즉시 실행 가능한 작업
1. ✅ 스타일 자동 추출 완료
2. ✅ 디자인 토큰 생성 완료
3. ⏳ Figma Variables 설정
4. ⏳ 컴포넌트 라이브러리 생성
5. ⏳ 페이지 디자인 시작

### 권장 작업 순서
1. **주요 색상 정리** (15개 → 8-10개로 축소)
2. **인라인 스타일 제거** (CSS 변수로 대체)
3. **컴포넌트 표준화** (일관된 패턴 적용)
4. **반응형 그리드 시스템 구축**

## 🔧 유지보수

### 새로운 색상 추가 시
1. `tokens.js`에 색상 정의
2. `tailwind.config.js` 업데이트
3. 스타일 추출 스크립트 재실행
4. Figma Variables 동기화

### 컴포넌트 변경 시
1. 자동 추출 스크립트 실행
2. 변경사항 분석
3. Figma 컴포넌트 업데이트
4. 문서 갱신

---

*이 디자인 시스템은 코드베이스 분석을 통해 자동 생성되었으며, 지속적인 업데이트가 가능합니다.*