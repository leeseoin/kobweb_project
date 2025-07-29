package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.domain.Alarm;
import com.kob_backend_seoin.kob_backend.dto.Alarm.AlarmRequestDto;
import com.kob_backend_seoin.kob_backend.dto.Alarm.AlarmResponseDto;
import com.kob_backend_seoin.kob_backend.exception.CustomException;
import com.kob_backend_seoin.kob_backend.exception.ErrorCode;
import com.kob_backend_seoin.kob_backend.repository.AlarmRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AlarmService {
    private final AlarmRepository alarmRepository;

    @Autowired
    public AlarmService(AlarmRepository alarmRepository) {
        this.alarmRepository = alarmRepository;
    }

    // 알람 생성
    public AlarmResponseDto createAlarm(UUID userId, AlarmRequestDto dto) {
        Alarm alarm = new Alarm();
        alarm.setUserId(userId);
        alarm.setTitle(dto.getTitle());
        alarm.setContent(dto.getContent());
        alarm.setAlarmTime(dto.getAlarmTime());
        alarm.setAlarmType(dto.getAlarmType());
        
        Alarm saved = alarmRepository.save(alarm);
        return toDto(saved);
    }

    // 사용자별 알람 목록 조회 (페이징)
    public Page<AlarmResponseDto> getUserAlarms(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Alarm> alarms = alarmRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return alarms.map(this::toDto);
    }

    // 사용자별 읽지 않은 알람 목록 조회
    public List<AlarmResponseDto> getUnreadAlarms(UUID userId) {
        List<Alarm> alarms = alarmRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return alarms.stream().map(this::toDto).collect(Collectors.toList());
    }

    // 읽지 않은 알람 개수 조회
    public long getUnreadAlarmCount(UUID userId) {
        return alarmRepository.countByUserIdAndIsReadFalse(userId);
    }

    // 알람 상세 조회
    public AlarmResponseDto getAlarm(UUID userId, UUID alarmId) {
        Optional<Alarm> alarm = alarmRepository.findById(alarmId);
        if (alarm.isEmpty() || !alarm.get().getUserId().equals(userId)) {
            throw new CustomException("알람을 찾을 수 없습니다.", ErrorCode.NOT_FOUND);
        }
        return toDto(alarm.get());
    }

    // 알람 읽음 처리
    public AlarmResponseDto markAsRead(UUID userId, UUID alarmId) {
        Optional<Alarm> alarm = alarmRepository.findById(alarmId);
        if (alarm.isEmpty() || !alarm.get().getUserId().equals(userId)) {
            throw new CustomException("알람을 찾을 수 없습니다.", ErrorCode.NOT_FOUND);
        }
        
        Alarm alarmEntity = alarm.get();
        alarmEntity.setRead(true);
        Alarm saved = alarmRepository.save(alarmEntity);
        return toDto(saved);
    }

    // 모든 알람 읽음 처리
    public void markAllAsRead(UUID userId) {
        List<Alarm> unreadAlarms = alarmRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Alarm alarm : unreadAlarms) {
            alarm.setRead(true);
        }
        alarmRepository.saveAll(unreadAlarms);
    }

    // 알람 삭제
    public void deleteAlarm(UUID userId, UUID alarmId) {
        Optional<Alarm> alarm = alarmRepository.findById(alarmId);
        if (alarm.isEmpty() || !alarm.get().getUserId().equals(userId)) {
            throw new CustomException("알람을 찾을 수 없습니다.", ErrorCode.NOT_FOUND);
        }
        alarmRepository.delete(alarm.get());
    }

    // 알람 타입별 조회
    public Page<AlarmResponseDto> getAlarmsByType(UUID userId, String alarmType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Alarm> alarms = alarmRepository.findByUserIdAndAlarmTypeOrderByCreatedAtDesc(userId, alarmType, pageable);
        return alarms.map(this::toDto);
    }

    // 제목으로 알람 검색
    public Page<AlarmResponseDto> searchAlarmsByTitle(UUID userId, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Alarm> alarms = alarmRepository.findByUserIdAndTitleContaining(userId, keyword, pageable);
        return alarms.map(this::toDto);
    }

    // 시스템 알람 생성 (관리자용)
    public AlarmResponseDto createSystemAlarm(UUID userId, String title, String content) {
        AlarmRequestDto dto = new AlarmRequestDto();
        dto.setTitle(title);
        dto.setContent(content);
        dto.setAlarmTime(java.time.LocalDateTime.now());
        dto.setAlarmType("SYSTEM");
        
        return createAlarm(userId, dto);
    }

    // DTO 변환 메서드
    private AlarmResponseDto toDto(Alarm alarm) {
        return new AlarmResponseDto(
            alarm.getAlarmId().toString(),
            alarm.getTitle(),
            alarm.getContent(),
            alarm.getAlarmTime(),
            alarm.isRead(),
            alarm.getAlarmType(),
            alarm.getCreatedAt(),
            alarm.getUpdatedAt()
        );
    }
} 