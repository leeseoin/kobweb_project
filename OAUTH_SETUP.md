# OAuth2 소셜 로그인 설정 가이드

이 문서는 구글과 깃허브 OAuth2 로그인을 설정하는 방법을 설명합니다.

## 🔧 OAuth 앱 설정

### 1. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. "APIs & Services" > "Credentials" 메뉴로 이동
4. "CREATE CREDENTIALS" > "OAuth client ID" 선택
5. Application type: "Web application" 선택
6. 설정값 입력:
   - **Name**: Kobweb Business Card Manager
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (개발 환경)
     - `https://your-domain.com` (운영 환경)
   - **Authorized redirect URIs**:
     - `http://localhost:8080/login/oauth2/code/google` (개발 환경)
     - `https://your-api-domain.com/login/oauth2/code/google` (운영 환경)
7. Client ID와 Client Secret 복사

### 2. GitHub OAuth 설정

1. [GitHub Settings](https://github.com/settings/applications/new) 접속
2. "New OAuth App" 클릭
3. 설정값 입력:
   - **Application name**: Kobweb Business Card Manager
   - **Homepage URL**:
     - `http://localhost:3000` (개발 환경)
     - `https://your-domain.com` (운영 환경)
   - **Authorization callback URL**:
     - `http://localhost:8080/login/oauth2/code/github` (개발 환경)
     - `https://your-api-domain.com/login/oauth2/code/github` (운영 환경)
4. "Register application" 클릭
5. Client ID와 Client Secret 복사

## 🔐 환경 변수 설정

### 백엔드 환경 변수

`.env` 파일을 생성하거나 시스템 환경 변수로 설정:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Redirect URI (프론트엔드 콜백 URL)
GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
GITHUB_REDIRECT_URI=http://localhost:8080/login/oauth2/code/github
```

### Windows에서 환경 변수 설정
```cmd
set GOOGLE_CLIENT_ID=your-google-client-id
set GOOGLE_CLIENT_SECRET=your-google-client-secret
set GITHUB_CLIENT_ID=your-github-client-id
set GITHUB_CLIENT_SECRET=your-github-client-secret
```

### macOS/Linux에서 환경 변수 설정
```bash
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret
export GITHUB_CLIENT_ID=your-github-client-id
export GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 🧪 테스트 방법

### 1. 로컬 개발 환경 테스트

1. 백엔드 서버 실행:
```bash
cd kobweb_back
./gradlew bootRun
```

2. 프론트엔드 서버 실행:
```bash
cd kobweb_pront
npm run dev
```

3. 브라우저에서 테스트:
   - http://localhost:3000/login 접속
   - "Sign in with Google" 또는 "Sign in with GitHub" 버튼 클릭
   - OAuth 인증 프로세스 진행
   - 성공 시 대시보드로 리다이렉트 확인

### 2. 테스트 체크리스트

- [ ] Google 로그인 버튼 클릭 시 Google 인증 페이지로 이동
- [ ] GitHub 로그인 버튼 클릭 시 GitHub 인증 페이지로 이동
- [ ] OAuth 인증 성공 후 프론트엔드 콜백 페이지로 리다이렉트
- [ ] JWT 토큰이 로컬 스토리지에 저장됨
- [ ] 대시보드로 자동 리다이렉트
- [ ] 로그인 상태 유지 (페이지 새로고침 시)

### 3. 문제 해결

#### Google OAuth 오류
- **redirect_uri_mismatch**: Google Console에서 리다이렉트 URI 확인
- **invalid_client**: Client ID와 Secret 재확인
- **access_denied**: 사용자가 권한 거부

#### GitHub OAuth 오류
- **redirect_uri_mismatch**: GitHub 앱 설정에서 콜백 URL 확인
- **unauthorized_client**: Client ID와 Secret 재확인
- **access_denied**: 사용자가 권한 거부

#### 일반적인 오류
- **CORS 오류**: 백엔드 CORS 설정 확인
- **토큰 없음**: OAuth 성공 핸들러에서 토큰 생성 확인
- **리다이렉트 실패**: 프론트엔드 콜백 URL 확인

## 🔄 OAuth 플로우

1. 사용자가 "Sign in with Google/GitHub" 버튼 클릭
2. 백엔드의 `/oauth2/authorization/{provider}` 엔드포인트로 리다이렉트
3. OAuth 제공자의 인증 페이지로 리다이렉트
4. 사용자가 권한 승인
5. OAuth 제공자가 백엔드의 `/login/oauth2/code/{provider}`로 콜백
6. 백엔드에서 사용자 정보 처리 및 JWT 토큰 생성
7. 프론트엔드 콜백 페이지로 토큰과 함께 리다이렉트
8. 프론트엔드에서 토큰 저장 및 대시보드로 이동

## 📝 로그 확인

### 백엔드 로그
```bash
# OAuth 관련 로그 확인
grep -i oauth logs/application.log
grep -i "OAuth2UserService" logs/application.log
```

### 브라우저 개발자 도구
- Network 탭에서 OAuth 요청/응답 확인
- Console 탭에서 JavaScript 오류 확인
- Application 탭에서 로컬 스토리지의 토큰 확인

## 🚀 운영 환경 배포

운영 환경에서는 다음 사항을 추가로 설정해주세요:

1. **HTTPS 필수**: OAuth 제공자들은 HTTPS를 요구합니다
2. **도메인 등록**: OAuth 앱 설정에서 실제 운영 도메인 등록
3. **환경 변수**: 운영 환경의 Client ID/Secret으로 변경
4. **CORS 설정**: 운영 도메인만 허용하도록 제한

## 📞 지원

OAuth 설정 중 문제가 발생하면:

1. 이 문서의 설정 단계를 다시 확인
2. OAuth 제공자의 공식 문서 참조
3. 백엔드/프론트엔드 로그 확인
4. GitHub Issues에 문제 상황 제보