package com.kob_backend_seoin.kob_backend.repository;

import com.kob_backend_seoin.kob_backend.domain.Alarm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AlarmRepository extends JpaRepository<Alarm, UUID> {
    
    // 사용자별 알람 목록 조회 (최신순)
    Page<Alarm> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    
    // 사용자별 읽지 않은 알람 목록 조회
    List<Alarm> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(UUID userId);
    
    // 사용자별 읽지 않은 알람 개수 조회
    long countByUserIdAndIsReadFalse(UUID userId);
    
    // 특정 시간 이후의 알람 조회 (알람 스케줄링용)
    @Query("SELECT a FROM Alarm a WHERE a.alarmTime >= :currentTime AND a.isRead = false")
    List<Alarm> findUpcomingAlarms(@Param("currentTime") LocalDateTime currentTime);
    
    // 알람 타입별 조회
    Page<Alarm> findByUserIdAndAlarmTypeOrderByCreatedAtDesc(UUID userId, String alarmType, Pageable pageable);
    
    // 제목으로 검색
    @Query("SELECT a FROM Alarm a WHERE a.userId = :userId AND a.title LIKE %:keyword% ORDER BY a.createdAt DESC")
    Page<Alarm> findByUserIdAndTitleContaining(@Param("userId") UUID userId, @Param("keyword") String keyword, Pageable pageable);
} 