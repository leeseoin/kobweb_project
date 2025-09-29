# 테스트 실행 가이드

## 단계별 테스트 실행 방법

### 1단계: 기본 설정 확인
```bash
./gradlew test --tests "*step1.BasicTestSetup"
```
- 목적: Spring Boot 컨텍스트 로딩 및 기본 의존성 주입 확인
- 확인사항: UserRepository, MockMvc 정상 주입

### 2단계: 단일 유저 생성
```bash
./gradlew test --tests "*step2.SingleUserCreationTest"
```
- 목적: 회원가입 API 기본 동작 확인
- 확인사항: 단일 유저 정상 생성

### 3단계: 다중 유저 생성 (3명)
```bash
./gradlew test --tests "*step3.MultipleUsersCreationTest"
```
- 목적: 여러 유저 연속 생성 테스트
- 확인사항: 3명 유저 정상 생성, 카운트 증가 확인

### 4단계: 에러 처리 테스트
```bash
./gradlew test --tests "*step4.ErrorHandlingTest"
```
- 목적: 중복 이메일, 잘못된 데이터 처리 확인
- 확인사항: 409 Conflict, 400 Bad Request 응답

### 5단계: 최종 10명 유저 생성
```bash
./gradlew test --tests "*step5.FinalTenUsersTest"
```
- 목적: 요구사항인 10명 유저 생성 달성
- 확인사항: 10명 유저 정상 생성, 최종 카운트 확인

### 6단계: 생성된 유저 조회
```bash
./gradlew test --tests "*step6.UserListTest"
```
- 목적: 생성된 유저 목록 확인
- 확인사항: 전체 유저 목록, 최근 유저 조회

## 전체 단계 실행
```bash
./gradlew test --tests "*step*"
```

## 개별 단계 실행 예시
```bash
# 1단계만 실행
./gradlew test --tests "com.kob_backend_seoin.kob_backend.step1.*"

# 5단계만 실행
./gradlew test --tests "com.kob_backend_seoin.kob_backend.step5.FinalTenUsersTest.createTenUsers"
```

## 문제 해결

### Neo4j 연결 오류 시
- Neo4j 서버가 실행 중인지 확인: `docker ps`
- Neo4j 재시작: `docker restart neo4j`

### PostgreSQL 연결 오류 시
- PostgreSQL 서버 상태 확인
- application.yml의 데이터베이스 설정 확인

### 컴파일 오류 시
- 에러 코드 정의 확인: ErrorCode.java
- 필요한 필드 추가: User.java, BusinessCard.java

## 예상 결과
각 단계가 성공적으로 실행되면:
1. 기본 설정 확인 ✅
2. 단일 유저 생성 ✅
3. 3명 유저 생성 ✅
4. 에러 처리 확인 ✅
5. 10명 유저 생성 ✅
6. 유저 목록 조회 ✅

최종적으로 데이터베이스에 10명의 테스트 유저가 생성됩니다.