-- chat_rooms 테이블에 type 컬럼 추가 및 기존 데이터 업데이트
-- PostgreSQL에서 실행할 SQL 스크립트

-- 1. type 컬럼 추가 (기본값으로 'ONE_TO_ONE' 설정)
ALTER TABLE chat_rooms 
ADD COLUMN type VARCHAR(255) DEFAULT 'ONE_TO_ONE';

-- 2. 기존 데이터의 type 컬럼을 'ONE_TO_ONE'으로 설정
UPDATE chat_rooms 
SET type = 'ONE_TO_ONE' 
WHERE type IS NULL;

-- 3. type 컬럼을 NOT NULL로 설정
ALTER TABLE chat_rooms 
ALTER COLUMN type SET NOT NULL;

-- 4. type 컬럼에 체크 제약조건 추가
ALTER TABLE chat_rooms 
ADD CONSTRAINT chat_rooms_type_check 
CHECK (type IN ('ONE_TO_ONE', 'GROUP'));

-- 5. 변경사항 확인
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'chat_rooms' 
AND column_name = 'type';

-- 6. 기존 데이터 확인
SELECT id, name, type, created_at 
FROM chat_rooms 
LIMIT 10;
