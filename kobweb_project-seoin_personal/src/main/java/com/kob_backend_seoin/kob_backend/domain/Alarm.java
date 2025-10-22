package com.kob_backend_seoin.kob_backend.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "alarms")
public class Alarm {
    @Id
    @GeneratedValue
    private UUID alarmId;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime alarmTime;

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false)
    private String alarmType; // "SYSTEM", "REMINDER", "NOTIFICATION", "CONNECTION" 등

    // CONNECTION 알림용 추가 필드들
    private UUID relatedEntityId;    // 관련 엔티티 ID (FriendRequest ID 등)
    private String relatedEntityType; // 관련 엔티티 타입 ("FRIEND_REQUEST" 등)
    private String actionData;       // 액션 관련 데이터 (JSON 형태)

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // 기본 생성자
    public Alarm() {}

    public Alarm(UUID userId, String title, String content, LocalDateTime alarmTime, String alarmType) {
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.alarmTime = alarmTime;
        this.alarmType = alarmType;
    }

    // getter/setter
    public UUID getAlarmId() { return alarmId; }
    public void setAlarmId(UUID alarmId) { this.alarmId = alarmId; }
    
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public LocalDateTime getAlarmTime() { return alarmTime; }
    public void setAlarmTime(LocalDateTime alarmTime) { this.alarmTime = alarmTime; }
    
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    
    public String getAlarmType() { return alarmType; }
    public void setAlarmType(String alarmType) { this.alarmType = alarmType; }

    public UUID getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(UUID relatedEntityId) { this.relatedEntityId = relatedEntityId; }

    public String getRelatedEntityType() { return relatedEntityType; }
    public void setRelatedEntityType(String relatedEntityType) { this.relatedEntityType = relatedEntityType; }

    public String getActionData() { return actionData; }
    public void setActionData(String actionData) { this.actionData = actionData; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // CONNECTION 알림 생성을 위한 정적 메서드
    public static Alarm createConnectionAlarm(UUID userId, String title, String content, UUID friendRequestId) {
        Alarm alarm = new Alarm();
        alarm.setUserId(userId);
        alarm.setTitle(title);
        alarm.setContent(content);
        alarm.setAlarmTime(LocalDateTime.now());
        alarm.setAlarmType("CONNECTION");
        alarm.setRelatedEntityId(friendRequestId);
        alarm.setRelatedEntityType("FRIEND_REQUEST");
        return alarm;
    }

    // 명함 등록 요청 알림 생성을 위한 정적 메서드
    public static Alarm createBusinessCardRequestAlarm(UUID userId, String title, String content, UUID businessCardId) {
        Alarm alarm = new Alarm();
        alarm.setUserId(userId);
        alarm.setTitle(title);
        alarm.setContent(content);
        alarm.setAlarmTime(LocalDateTime.now());
        alarm.setAlarmType("CONNECTION");
        alarm.setRelatedEntityId(businessCardId);
        alarm.setRelatedEntityType("BUSINESS_CARD_REQUEST");
        return alarm;
    }
} 