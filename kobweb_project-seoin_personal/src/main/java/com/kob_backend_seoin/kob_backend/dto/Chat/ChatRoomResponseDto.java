package com.kob_backend_seoin.kob_backend.dto.Chat;

import com.kob_backend_seoin.kob_backend.domain.ChatRoom.ChatRoomType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ChatRoomResponseDto {
    private UUID id;
    private String name;
    private ChatRoomType type;
    private UserInfoDto creator;
    private LocalDateTime createdAt;
    private List<UserInfoDto> participants;
    private ChatMessageResponseDto lastMessage;
    private long unreadCount;

    // 기본 생성자
    public ChatRoomResponseDto() {}

    public ChatRoomResponseDto(UUID id, String name, ChatRoomType type, UserInfoDto creator, LocalDateTime createdAt,
                              List<UserInfoDto> participants, ChatMessageResponseDto lastMessage, long unreadCount) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.creator = creator;
        this.createdAt = createdAt;
        this.participants = participants;
        this.lastMessage = lastMessage;
        this.unreadCount = unreadCount;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public UserInfoDto getCreator() {
        return creator;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<UserInfoDto> getParticipants() {
        return participants;
    }

    public ChatMessageResponseDto getLastMessage() {
        return lastMessage;
    }

    public long getUnreadCount() {
        return unreadCount;
    }

    public ChatRoomType getType() {
        return type;
    }

    public void setType(ChatRoomType type) {
        this.type = type;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCreator(UserInfoDto creator) {
        this.creator = creator;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setParticipants(List<UserInfoDto> participants) {
        this.participants = participants;
    }

    public void setLastMessage(ChatMessageResponseDto lastMessage) {
        this.lastMessage = lastMessage;
    }

    public void setUnreadCount(long unreadCount) {
        this.unreadCount = unreadCount;
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