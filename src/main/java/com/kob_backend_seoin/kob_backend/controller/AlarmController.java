package com.kob_backend_seoin.kob_backend.controller;

import com.kob_backend_seoin.kob_backend.dto.Alarm.AlarmRequestDto;
import com.kob_backend_seoin.kob_backend.dto.Alarm.AlarmResponseDto;
import com.kob_backend_seoin.kob_backend.dto.ApiResponse;
import com.kob_backend_seoin.kob_backend.service.AlarmService;
import com.kob_backend_seoin.kob_backend.service.JwtProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/alarms")
@Tag(name = "Alarm", description = "알람 관련 API")
public class AlarmController {
    
    private final AlarmService alarmService;
    private final JwtProvider jwtProvider;

    @Autowired
    public AlarmController(AlarmService alarmService, JwtProvider jwtProvider) {
        this.alarmService = alarmService;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping
    @Operation(summary = "알람 생성", description = "새로운 알람을 생성합니다.")
    public ResponseEntity<ApiResponse<AlarmResponseDto>> createAlarm(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody AlarmRequestDto requestDto) {
        
        UUID userId = extractUserIdFromToken(token);
        AlarmResponseDto response = alarmService.createAlarm(userId, requestDto);
        return ResponseEntity.ok(new ApiResponse<>(true, response, "알람이 성공적으로 생성되었습니다."));
    }

    @GetMapping
    @Operation(summary = "알람 목록 조회", description = "사용자의 알람 목록을 페이징으로 조회합니다.")
    public ResponseEntity<ApiResponse<Page<AlarmResponseDto>>> getUserAlarms(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        UUID userId = extractUserIdFromToken(token);
        Page<AlarmResponseDto> alarms = alarmService.getUserAlarms(userId, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, alarms, "알람 목록을 성공적으로 조회했습니다."));
    }

    @GetMapping("/unread")
    @Operation(summary = "읽지 않은 알람 조회", description = "사용자의 읽지 않은 알람 목록을 조회합니다.")
    public ResponseEntity<ApiResponse<List<AlarmResponseDto>>> getUnreadAlarms(
            @RequestHeader("Authorization") String token) {
        
        UUID userId = extractUserIdFromToken(token);
        List<AlarmResponseDto> alarms = alarmService.getUnreadAlarms(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, alarms, "읽지 않은 알람 목록을 성공적으로 조회했습니다."));
    }

    @GetMapping("/unread/count")
    @Operation(summary = "읽지 않은 알람 개수 조회", description = "사용자의 읽지 않은 알람 개수를 조회합니다.")
    public ResponseEntity<ApiResponse<Long>> getUnreadAlarmCount(
            @RequestHeader("Authorization") String token) {
        
        UUID userId = extractUserIdFromToken(token);
        long count = alarmService.getUnreadAlarmCount(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, count, "읽지 않은 알람 개수를 성공적으로 조회했습니다."));
    }

    @GetMapping("/{alarmId}")
    @Operation(summary = "알람 상세 조회", description = "특정 알람의 상세 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<AlarmResponseDto>> getAlarm(
            @RequestHeader("Authorization") String token,
            @PathVariable UUID alarmId) {
        
        UUID userId = extractUserIdFromToken(token);
        AlarmResponseDto alarm = alarmService.getAlarm(userId, alarmId);
        return ResponseEntity.ok(new ApiResponse<>(true, alarm, "알람을 성공적으로 조회했습니다."));
    }

    @PutMapping("/{alarmId}/read")
    @Operation(summary = "알람 읽음 처리", description = "특정 알람을 읽음 상태로 변경합니다.")
    public ResponseEntity<ApiResponse<AlarmResponseDto>> markAsRead(
            @RequestHeader("Authorization") String token,
            @PathVariable UUID alarmId) {
        
        UUID userId = extractUserIdFromToken(token);
        AlarmResponseDto alarm = alarmService.markAsRead(userId, alarmId);
        return ResponseEntity.ok(new ApiResponse<>(true, alarm, "알람을 읽음 처리했습니다."));
    }

    @PutMapping("/read-all")
    @Operation(summary = "모든 알람 읽음 처리", description = "사용자의 모든 알람을 읽음 상태로 변경합니다.")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @RequestHeader("Authorization") String token) {
        
        UUID userId = extractUserIdFromToken(token);
        alarmService.markAllAsRead(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "모든 알람을 읽음 처리했습니다."));
    }

    @DeleteMapping("/{alarmId}")
    @Operation(summary = "알람 삭제", description = "특정 알람을 삭제합니다.")
    public ResponseEntity<ApiResponse<Void>> deleteAlarm(
            @RequestHeader("Authorization") String token,
            @PathVariable UUID alarmId) {
        
        UUID userId = extractUserIdFromToken(token);
        alarmService.deleteAlarm(userId, alarmId);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "알람을 성공적으로 삭제했습니다."));
    }

    @GetMapping("/type/{alarmType}")
    @Operation(summary = "알람 타입별 조회", description = "특정 타입의 알람 목록을 조회합니다.")
    public ResponseEntity<ApiResponse<Page<AlarmResponseDto>>> getAlarmsByType(
            @RequestHeader("Authorization") String token,
            @PathVariable String alarmType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        UUID userId = extractUserIdFromToken(token);
        Page<AlarmResponseDto> alarms = alarmService.getAlarmsByType(userId, alarmType, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, alarms, "알람 타입별 목록을 성공적으로 조회했습니다."));
    }

    @GetMapping("/search")
    @Operation(summary = "알람 제목 검색", description = "제목으로 알람을 검색합니다.")
    public ResponseEntity<ApiResponse<Page<AlarmResponseDto>>> searchAlarmsByTitle(
            @RequestHeader("Authorization") String token,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        UUID userId = extractUserIdFromToken(token);
        Page<AlarmResponseDto> alarms = alarmService.searchAlarmsByTitle(userId, keyword, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, alarms, "알람 검색을 성공적으로 완료했습니다."));
    }

    // JWT 토큰에서 userId 추출하는 메서드
    private UUID extractUserIdFromToken(String token) {
        try {
            // 토큰이 null이거나 비어있으면 에러
            if (token == null || token.trim().isEmpty()) {
                throw new RuntimeException("토큰이 제공되지 않았습니다.");
            }
            
            // 모든 "Bearer " 접두사 제거 (중복된 경우 처리)
            while (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            // JWT 토큰 검증 및 디코딩
            var decodedJWT = jwtProvider.verifyToken(token);
            String userId = decodedJWT.getSubject();
            
            return UUID.fromString(userId);
        } catch (Exception e) {
            throw new RuntimeException("유효하지 않은 토큰입니다.", e);
        }
    }
} 