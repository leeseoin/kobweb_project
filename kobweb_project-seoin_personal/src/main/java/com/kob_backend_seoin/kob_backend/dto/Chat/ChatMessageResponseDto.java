package com.kob_backend_seoin.kob_backend.dto.Chat;

import java.time.LocalDateTime;
import java.util.UUID;

public class ChatMessageResponseDto {
    private UUID id;
    private String content;
    private UserInfoDto sender;
    private UUID chatRoomId;
    private LocalDateTime sentAt;

    // 기본 생성자
    public ChatMessageResponseDto() {}

    public ChatMessageResponseDto(UUID id, String content, UserInfoDto sender, UUID chatRoomId, LocalDateTime sentAt) {
        this.id = id;
        this.content = content;
        this.sender = sender;
        this.chatRoomId = chatRoomId;
        this.sentAt = sentAt;
    }

    public UUID getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public UserInfoDto getSender() {
        return sender;
    }

    public UUID getChatRoomId() {
        return chatRoomId;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setSender(UserInfoDto sender) {
        this.sender = sender;
    }

    public void setChatRoomId(UUID chatRoomId) {
        this.chatRoomId = chatRoomId;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    // 내부 클래스: 사용자 정보
    public static class UserInfoDto {
        private UUID id;
        private String nickname;

        public UserInfoDto() {}

        public UserInfoDto(UUID id, String nickname) {
            this.id = id;
            this.nickname = nickname;
        }

        public UUID getId() {
            return id;
        }

        public String getNickname() {
            return nickname;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public void setNickname(String nickname) {
            this.nickname = nickname;
        }
    }
} 