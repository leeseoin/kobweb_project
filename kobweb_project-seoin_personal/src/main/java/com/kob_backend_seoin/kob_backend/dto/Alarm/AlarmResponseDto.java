package com.kob_backend_seoin.kob_backend.dto.Alarm;

import java.time.LocalDateTime;
import java.util.UUID;

public class AlarmResponseDto {
    private String alarmId;
    private String title;
    private String content;
    private LocalDateTime alarmTime;
    private boolean isRead;
    private String alarmType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // CONNECTION 알림용 추가 필드들
    private UUID relatedEntityId;
    private String relatedEntityType;
    private String actionData;

    public AlarmResponseDto(String alarmId, String title, String content, LocalDateTime alarmTime,
                          boolean isRead, String alarmType, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.alarmId = alarmId;
        this.title = title;
        this.content = content;
        this.alarmTime = alarmTime;
        this.isRead = isRead;
        this.alarmType = alarmType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // CONNECTION 알림용 생성자
    public AlarmResponseDto(String alarmId, String title, String content, LocalDateTime alarmTime,
                          boolean isRead, String alarmType, LocalDateTime createdAt, LocalDateTime updatedAt,
                          UUID relatedEntityId, String relatedEntityType, String actionData) {
        this.alarmId = alarmId;
        this.title = title;
        this.content = content;
        this.alarmTime = alarmTime;
        this.isRead = isRead;
        this.alarmType = alarmType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.relatedEntityId = relatedEntityId;
        this.relatedEntityType = relatedEntityType;
        this.actionData = actionData;
    }

    // Getters
    public String getAlarmId() { return alarmId; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public LocalDateTime getAlarmTime() { return alarmTime; }
    public boolean isRead() { return isRead; }
    public String getAlarmType() { return alarmType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // CONNECTION 알림용 추가 Getters
    public UUID getRelatedEntityId() { return relatedEntityId; }
    public String getRelatedEntityType() { return relatedEntityType; }
    public String getActionData() { return actionData; }

    // Setters
    public void setAlarmId(String alarmId) { this.alarmId = alarmId; }
    public void setTitle(String title) { this.title = title; }
    public void setContent(String content) { this.content = content; }
    public void setAlarmTime(LocalDateTime alarmTime) { this.alarmTime = alarmTime; }
    public void setRead(boolean read) { isRead = read; }
    public void setAlarmType(String alarmType) { this.alarmType = alarmType; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // CONNECTION 알림용 추가 Setters
    public void setRelatedEntityId(UUID relatedEntityId) { this.relatedEntityId = relatedEntityId; }
    public void setRelatedEntityType(String relatedEntityType) { this.relatedEntityType = relatedEntityType; }
    public void setActionData(String actionData) { this.actionData = actionData; }
} 