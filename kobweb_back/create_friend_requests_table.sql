-- friend_requests 테이블 생성 스크립트
-- PostgreSQL에서 실행할 SQL 스크립트

-- 1. friend_requests 테이블 생성
CREATE TABLE IF NOT EXISTS friend_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    message TEXT,
    sent_at TIMESTAMP WITHOUT TIME ZONE,
    responded_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

    -- 제약조건
    CONSTRAINT fk_friend_requests_sender FOREIGN KEY (sender_id) REFERENCES users(id),
    CONSTRAINT fk_friend_requests_receiver FOREIGN KEY (receiver_id) REFERENCES users(id),
    CONSTRAINT friend_requests_status_check CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED')),
    CONSTRAINT friend_requests_different_users CHECK (sender_id != receiver_id)
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_id ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_created_at ON friend_requests(created_at);

-- 3. 중복 요청 방지를 위한 복합 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS idx_friend_requests_unique_pending
ON friend_requests(sender_id, receiver_id)
WHERE status = 'PENDING';

-- 4. 생성된 테이블 확인
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'friend_requests'
ORDER BY ordinal_position;

-- 5. 제약조건 확인
SELECT
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'friend_requests';