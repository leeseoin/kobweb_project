package com.kob_backend_seoin.kob_backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class MessageReadId implements Serializable {

    @Column(name = "message_id")
    private UUID messageId;

    @Column(name = "user_id")
    private UUID userId;

    // 기본 생성자
    public MessageReadId() {}

    public MessageReadId(UUID messageId, UUID userId) {
        this.messageId = messageId;
        this.userId = userId;
    }

    // Getters and Setters
    public UUID getMessageId() {
        return messageId;
    }

    public void setMessageId(UUID messageId) {
        this.messageId = messageId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MessageReadId that = (MessageReadId) o;
        return Objects.equals(messageId, that.messageId) &&
               Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(messageId, userId);
    }

    @Override
    public String toString() {
        return "MessageReadId{" +
                "messageId=" + messageId +
                ", userId=" + userId +
                '}';
    }
}