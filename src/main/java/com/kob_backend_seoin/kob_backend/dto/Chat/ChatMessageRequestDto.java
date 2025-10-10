package com.kob_backend_seoin.kob_backend.dto.Chat;

public class ChatMessageRequestDto {
    private String content;

    // 기본 생성자
    public ChatMessageRequestDto() {}

    public ChatMessageRequestDto(String content) {
        this.content = content;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
} 