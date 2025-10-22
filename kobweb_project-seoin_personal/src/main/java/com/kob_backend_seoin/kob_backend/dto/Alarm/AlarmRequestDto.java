package com.kob_backend_seoin.kob_backend.dto.Alarm;

import java.time.LocalDateTime;

public class AlarmRequestDto {
    private String title;
    private String content;
    private LocalDateTime alarmTime;
    private String alarmType; // "SYSTEM", "REMINDER", "NOTIFICATION" 등

    public AlarmRequestDto() {}

    public AlarmRequestDto(String title, String content, LocalDateTime alarmTime, String alarmType) {
        this.title = title;
        this.content = content;
        this.alarmTime = alarmTime;
        this.alarmType = alarmType;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getAlarmTime() { return alarmTime; }
    public void setAlarmTime(LocalDateTime alarmTime) { this.alarmTime = alarmTime; }

    public String getAlarmType() { return alarmType; }
    public void setAlarmType(String alarmType) { this.alarmType = alarmType; }
} 