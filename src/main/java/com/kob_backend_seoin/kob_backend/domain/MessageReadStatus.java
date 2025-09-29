package com.kob_backend_seoin.kob_backend.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "message_read_status")
public class MessageReadStatus {

    @EmbeddedId
    private MessageReadId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("messageId")
    @JoinColumn(name = "message_id")
    private ChatMessage message;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private LocalDateTime readAt;

    // 읽음 상태 (향후 확장용)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReadStatus status = ReadStatus.read;

    public enum ReadStatus {
        read,       // 읽음
        delivered,  // 전달됨 (읽지 않음)
        unread     // 미전달
    }

    // 기본 생성자
    public MessageReadStatus() {}

    public MessageReadStatus(ChatMessage message, User user) {
        this.id = new MessageReadId(message.getId(), user.getId());
        this.message = message;
        this.user = user;
        this.readAt = LocalDateTime.now();
        this.status = ReadStatus.read;
    }

    public MessageReadStatus(ChatMessage message, User user, ReadStatus status) {
        this.id = new MessageReadId(message.getId(), user.getId());
        this.message = message;
        this.user = user;
        this.readAt = LocalDateTime.now();
        this.status = status;
    }

    // Getters and Setters
    public MessageReadId getId() {
        return id;
    }

    public void setId(MessageReadId id) {
        this.id = id;
    }

    public ChatMessage getMessage() {
        return message;
    }

    public void setMessage(ChatMessage message) {
        this.message = message;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    public ReadStatus getStatus() {
        return status;
    }

    public void setStatus(ReadStatus status) {
        this.status = status;
    }

    // 편의 메서드들
    public boolean isRead() {
        return status == ReadStatus.read;
    }

    public void markAsRead() {
        this.status = ReadStatus.read;
        this.readAt = LocalDateTime.now();
    }

    public void markAsDelivered() {
        this.status = ReadStatus.delivered;
        this.readAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MessageReadStatus that = (MessageReadStatus) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "MessageReadStatus{" +
                "id=" + id +
                ", status=" + status +
                ", readAt=" + readAt +
                '}';
    }
}