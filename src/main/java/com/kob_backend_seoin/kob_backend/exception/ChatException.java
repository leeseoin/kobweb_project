package com.kob_backend_seoin.kob_backend.exception;

public class ChatException extends RuntimeException {
    private final ChatErrorCode errorCode;
    private final String details;

    public ChatException(ChatErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.details = null;
    }

    public ChatException(ChatErrorCode errorCode, String details) {
        super(errorCode.getMessage() + (details != null ? ": " + details : ""));
        this.errorCode = errorCode;
        this.details = details;
    }

    public ChatException(ChatErrorCode errorCode, String details, Throwable cause) {
        super(errorCode.getMessage() + (details != null ? ": " + details : ""), cause);
        this.errorCode = errorCode;
        this.details = details;
    }

    public ChatErrorCode getErrorCode() {
        return errorCode;
    }

    public String getDetails() {
        return details;
    }

    public String getErrorCodeString() {
        return errorCode.getCode();
    }
}