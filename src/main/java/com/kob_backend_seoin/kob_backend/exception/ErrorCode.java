package com.kob_backend_seoin.kob_backend.exception;

public enum ErrorCode {
    // 기본 에러 코드
    INVALID_INPUT,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    ALREADY_EXISTS,
    INTERNAL_ERROR,

    // 사용자 관련 에러
    USER_NOT_FOUND,

    // 채팅 관련 에러
    CHAT_ROOM_NOT_FOUND,
    USER_NOT_IN_CHAT_ROOM,

    // 명함 관련 에러
    BUSINESS_CARD_NOT_FOUND
} 