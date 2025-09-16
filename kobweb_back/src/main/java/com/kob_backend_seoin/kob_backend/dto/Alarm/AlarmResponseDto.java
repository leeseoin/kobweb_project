package com.kob_backend_seoin.kob_backend.dto.Alarm;

import java.time.LocalDateTime;

public class AlarmResponseDto {
    private String alarmId;
    private String title;
    private String content;
    private LocalDateTime alarmTime;
    private boolean isRead;
    private String alarmType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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

    // Getters
    public String getAlarmId() { return alarmId; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public LocalDateTime getAlarmTime() { return alarmTime; }
    public boolean isRead() { return isRead; }
    public String getAlarmType() { return alarmType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setAlarmId(String alarmId) { this.alarmId = alarmId; }
    public void setTitle(String title) { this.title = title; }
    public void setContent(String content) { this.content = content; }
    public void setAlarmTime(LocalDateTime alarmTime) { this.alarmTime = alarmTime; }
    public void setRead(boolean read) { isRead = read; }
    public void setAlarmType(String alarmType) { this.alarmType = alarmType; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
} 