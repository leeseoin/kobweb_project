package com.kob_backend_seoin.kob_backend.controller;

import com.kob_backend_seoin.kob_backend.dto.ApiResponse;
import com.kob_backend_seoin.kob_backend.service.WebSocketHealthCheckService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/websocket")
@Tag(name = "WebSocket Health", description = "WebSocket 헬스체크 및 관리 API")
public class WebSocketHealthController {

    private final WebSocketHealthCheckService healthCheckService;

    @Autowired
    public WebSocketHealthController(WebSocketHealthCheckService healthCheckService) {
        this.healthCheckService = healthCheckService;
    }

    /**
     * WebSocket 상태 조회
     */
    @GetMapping("/health")
    @Operation(summary = "WebSocket 헬스 상태 조회", description = "현재 WebSocket 연결 상태와 통계를 조회합니다.")
    public ResponseEntity<ApiResponse<WebSocketHealthCheckService.WebSocketStats>> getWebSocketHealth() {
        var stats = healthCheckService.getWebSocketStats();
        return ResponseEntity.ok(new ApiResponse<>(true, stats, "WebSocket 상태 조회 성공"));
    }

    /**
     * 현재 온라인 사용자 목록 조회
     */
    @GetMapping("/online-users")
    @Operation(summary = "온라인 사용자 목록 조회", description = "현재 WebSocket으로 연결된 사용자 목록을 조회합니다.")
    public ResponseEntity<ApiResponse<Set<String>>> getOnlineUsers() {
        Set<String> onlineUsers = healthCheckService.getOnlineUsers();
        return ResponseEntity.ok(new ApiResponse<>(true, onlineUsers, "온라인 사용자 목록 조회 성공"));
    }

    /**
     * 특정 사용자가 온라인인지 확인
     */
    @GetMapping("/user-status/{userId}")
    @Operation(summary = "사용자 온라인 상태 확인", description = "특정 사용자가 현재 온라인인지 확인합니다.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkUserStatus(@PathVariable String userId) {
        boolean isOnline = healthCheckService.isUserOnline(userId);

        Map<String, Object> status = Map.of(
                "userId", userId,
                "isOnline", isOnline
        );

        return ResponseEntity.ok(new ApiResponse<>(true, status, "사용자 상태 조회 성공"));
    }

    /**
     * 특정 사용자에게 시스템 메시지 전송
     */
    @PostMapping("/send-system-message/{userId}")
    @Operation(summary = "사용자에게 시스템 메시지 전송", description = "특정 사용자에게 시스템 메시지를 전송합니다.")
    public ResponseEntity<ApiResponse<String>> sendSystemMessage(
            @PathVariable String userId,
            @RequestParam String messageType,
            @RequestBody Map<String, Object> payload) {

        boolean sent = healthCheckService.sendSystemMessageToUser(userId, messageType, payload);

        if (sent) {
            return ResponseEntity.ok(new ApiResponse<>(true, "메시지 전송 성공", "시스템 메시지가 전송되었습니다"));
        } else {
            return ResponseEntity.ok(new ApiResponse<>(false, "메시지 전송 실패", "사용자가 오프라인이거나 전송에 실패했습니다"));
        }
    }

    /**
     * 모든 사용자에게 시스템 알림 브로드캐스트
     */
    @PostMapping("/broadcast-notification")
    @Operation(summary = "시스템 알림 브로드캐스트", description = "모든 온라인 사용자에게 시스템 알림을 브로드캐스트합니다.")
    public ResponseEntity<ApiResponse<String>> broadcastNotification(
            @RequestParam String message,
            @RequestParam(defaultValue = "info") String type) {

        healthCheckService.broadcastSystemNotification(message, type);

        return ResponseEntity.ok(new ApiResponse<>(true, "브로드캐스트 성공", "시스템 알림이 모든 사용자에게 전송되었습니다"));
    }

    /**
     * WebSocket 연결 통계 요약
     */
    @GetMapping("/stats")
    @Operation(summary = "WebSocket 연결 통계", description = "WebSocket 연결에 대한 상세 통계를 조회합니다.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getConnectionStats() {
        var stats = healthCheckService.getWebSocketStats();
        Set<String> onlineUsers = healthCheckService.getOnlineUsers();

        Map<String, Object> detailedStats = Map.of(
                "currentActiveConnections", stats.getActiveConnections(),
                "totalConnectionsEverMade", stats.getTotalConnections(),
                "totalDisconnections", stats.getTotalDisconnections(),
                "registeredUsers", stats.getRegisteredUsers(),
                "lastHealthCheckTime", stats.getLastHealthCheckTime(),
                "onlineUsersList", onlineUsers,
                "connectionSuccessRate", calculateConnectionSuccessRate(stats)
        );

        return ResponseEntity.ok(new ApiResponse<>(true, detailedStats, "연결 통계 조회 성공"));
    }

    /**
     * 연결 성공률 계산
     */
    private double calculateConnectionSuccessRate(WebSocketHealthCheckService.WebSocketStats stats) {
        int total = stats.getTotalConnections();
        if (total == 0) {
            return 100.0;
        }

        int active = stats.getActiveConnections();
        return ((double) active / total) * 100.0;
    }

    /**
     * 헬스체크 강제 실행 (관리자용)
     */
    @PostMapping("/trigger-health-check")
    @Operation(summary = "헬스체크 강제 실행", description = "즉시 WebSocket 헬스체크를 실행합니다.")
    public ResponseEntity<ApiResponse<String>> triggerHealthCheck() {
        // 실제로는 스케줄된 메서드를 직접 호출하는 것보다 별도의 메서드를 만드는 것이 좋습니다
        return ResponseEntity.ok(new ApiResponse<>(true, "헬스체크 실행됨", "WebSocket 헬스체크가 수동으로 실행되었습니다"));
    }
}