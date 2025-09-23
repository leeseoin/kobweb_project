package com.kob_backend_seoin.kob_backend.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "friend_requests")
public class FriendRequest {
    @Id
    @GeneratedValue
    private UUID requestId;

    @Column(nullable = false)
    private UUID senderId;    // 요청 보낸 사람

    @Column(nullable = false)
    private UUID receiverId;  // 요청 받은 사람

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    private String message;   // 요청 메시지 (선택사항)

    private LocalDateTime sentAt;
    private LocalDateTime respondedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 요청 상태
    public enum RequestStatus {
        PENDING,   // 대기 중
        ACCEPTED,  // 수락됨
        REJECTED,  // 거절됨
        CANCELLED  // 취소됨
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        if (sentAt == null) {
            sentAt = createdAt;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (status != RequestStatus.PENDING && respondedAt == null) {
            respondedAt = LocalDateTime.now();
        }
    }

    // 기본 생성자
    public FriendRequest() {}

    // 생성자
    public FriendRequest(UUID senderId, UUID receiverId) {
        this.senderId = senderId;
        this.receiverId = receiverId;
    }

    public FriendRequest(UUID senderId, UUID receiverId, String message) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.message = message;
    }

    // 요청 수락
    public void accept() {
        this.status = RequestStatus.ACCEPTED;
        this.respondedAt = LocalDateTime.now();
    }

    // 요청 거절
    public void reject() {
        this.status = RequestStatus.REJECTED;
        this.respondedAt = LocalDateTime.now();
    }

    // 요청 취소
    public void cancel() {
        this.status = RequestStatus.CANCELLED;
        this.respondedAt = LocalDateTime.now();
    }

    // 대기 중인 요청인지 확인
    public boolean isPending() {
        return status == RequestStatus.PENDING;
    }

    // 완료된 요청인지 확인 (수락/거절/취소)
    public boolean isCompleted() {
        return status != RequestStatus.PENDING;
    }

    // Getters and Setters
    public UUID getRequestId() { return requestId; }
    public void setRequestId(UUID requestId) { this.requestId = requestId; }

    public UUID getSenderId() { return senderId; }
    public void setSenderId(UUID senderId) { this.senderId = senderId; }

    public UUID getReceiverId() { return receiverId; }
    public void setReceiverId(UUID receiverId) { this.receiverId = receiverId; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}