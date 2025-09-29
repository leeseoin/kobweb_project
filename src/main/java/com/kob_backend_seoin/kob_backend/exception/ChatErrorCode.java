package com.kob_backend_seoin.kob_backend.exception;

public enum ChatErrorCode {
    // 채팅방 관련 에러
    ROOM_NOT_FOUND("CHAT_001", "채팅방을 찾을 수 없습니다"),
    ROOM_ACCESS_DENIED("CHAT_002", "채팅방에 접근 권한이 없습니다"),
    ROOM_FULL("CHAT_003", "채팅방이 가득 참"),
    ROOM_CREATION_FAILED("CHAT_004", "채팅방 생성에 실패했습니다"),

    // 메시지 관련 에러
    MESSAGE_TOO_LONG("CHAT_005", "메시지가 너무 깁니다"),
    MESSAGE_EMPTY("CHAT_006", "메시지 내용이 비어있습니다"),
    MESSAGE_SEND_FAILED("CHAT_007", "메시지 전송에 실패했습니다"),
    DUPLICATE_MESSAGE("CHAT_008", "중복된 메시지입니다"),

    // 사용자 관련 에러
    USER_NOT_IN_ROOM("CHAT_009", "사용자가 해당 채팅방에 참여하지 않습니다"),
    USER_ALREADY_IN_ROOM("CHAT_010", "사용자가 이미 채팅방에 참여하고 있습니다"),
    UNAUTHORIZED_ACCESS("CHAT_011", "인증되지 않은 접근입니다"),

    // WebSocket 관련 에러
    WEBSOCKET_CONNECTION_FAILED("CHAT_012", "WebSocket 연결에 실패했습니다"),
    WEBSOCKET_AUTH_FAILED("CHAT_013", "WebSocket 인증에 실패했습니다"),

    // 일반적인 에러
    INTERNAL_SERVER_ERROR("CHAT_014", "서버 내부 오류가 발생했습니다"),
    INVALID_REQUEST("CHAT_015", "잘못된 요청입니다");

    private final String code;
    private final String message;

    ChatErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}