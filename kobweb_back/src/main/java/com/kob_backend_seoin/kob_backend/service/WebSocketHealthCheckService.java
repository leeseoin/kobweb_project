package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.dto.Chat.WsEnvelope;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Logger;

@Service
public class WebSocketHealthCheckService {

    private static final Logger log = Logger.getLogger(WebSocketHealthCheckService.class.getName());

    private final SimpMessagingTemplate messagingTemplate;
    private final SimpUserRegistry userRegistry;

    // 활성 연결 추적
    private final Map<String, ConnectionInfo> activeConnections = new ConcurrentHashMap<>();

    // 통계 정보
    private final AtomicInteger totalConnections = new AtomicInteger(0);
    private final AtomicInteger totalDisconnections = new AtomicInteger(0);
    private LocalDateTime lastHealthCheckTime = LocalDateTime.now();

    @Autowired
    public WebSocketHealthCheckService(SimpMessagingTemplate messagingTemplate,
                                      SimpUserRegistry userRegistry) {
        this.messagingTemplate = messagingTemplate;
        this.userRegistry = userRegistry;
    }

    /**
     * 주기적인 헬스체크 (5분마다)
     */
    @Scheduled(fixedDelay = 300000)
    public void performHealthCheck() {
        try {
            if (log.isLoggable(java.util.logging.Level.FINE)) {
                log.fine("=== WebSocket 헬스체크 시작 ===");
            }

            // 현재 연결된 사용자 수 확인
            int registeredUsers = userRegistry.getUserCount();
            int activeConnectionsCount = activeConnections.size();

            // 연결 불일치 감지 및 정리
            cleanupStaleConnections();

            // 시스템 상태 메시지 브로드캐스트 (선택적)
            if (shouldSendHealthBroadcast()) {
                sendHealthBroadcast();
            }

            lastHealthCheckTime = LocalDateTime.now();

            // 중요한 정보만 INFO 레벨로 로깅
            if (activeConnectionsCount > 0) {
                log.info("WebSocket 헬스체크 - 등록된 사용자: " + registeredUsers + 
                        ", 활성 연결: " + activeConnectionsCount);
            }

        } catch (Exception e) {
            log.severe("WebSocket 헬스체크 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 개별 사용자에게 핑 메시지 전송 (60초마다)
     */
    @Scheduled(fixedDelay = 60000)
    public void sendPingToUsers() {
        try {
            Set<String> userNames = activeConnections.keySet();

            if (userNames.isEmpty()) {
                return;
            }

            if (log.isLoggable(java.util.logging.Level.FINE)) {
                log.fine("활성 사용자 " + userNames.size() + "명에게 핑 전송");
            }

            WsEnvelope<Map<String, Object>> pingMessage = new WsEnvelope<>(
                    "system.ping",
                    WsEnvelope.newMessageId(),
                    System.currentTimeMillis(),
                    Map.of(
                            "timestamp", System.currentTimeMillis(),
                            "serverTime", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                    )
            );

            int successCount = 0;
            int failCount = 0;

            for (String userName : userNames) {
                try {
                    messagingTemplate.convertAndSendToUser(userName, "/queue/system", pingMessage);
                    updateConnectionActivity(userName);
                    successCount++;
                } catch (Exception e) {
                    log.warning("사용자 " + userName + "에게 핑 전송 실패: " + e.getMessage());
                    // 전송 실패한 연결은 비활성으로 표시
                    markConnectionAsInactive(userName);
                    failCount++;
                }
            }

            // 결과 요약만 로깅
            if (failCount > 0) {
                log.warning("핑 전송 완료 - 성공: " + successCount + ", 실패: " + failCount);
            }

        } catch (Exception e) {
            log.severe("핑 전송 중 오류 발생: " + e.getMessage());
        }
    }

    /**
     * 연결 등록
     */
    public void registerConnection(String userId, String sessionId) {
        ConnectionInfo info = new ConnectionInfo(userId, sessionId);
        activeConnections.put(userId, info);
        totalConnections.incrementAndGet();

        if (log.isLoggable(java.util.logging.Level.FINE)) {
            log.fine("새 WebSocket 연결 등록: 사용자 " + userId + ", 세션 " + sessionId);
        }
    }

    /**
     * 연결 해제
     */
    public void unregisterConnection(String userId) {
        ConnectionInfo removed = activeConnections.remove(userId);
        if (removed != null) {
            totalDisconnections.incrementAndGet();
            if (log.isLoggable(java.util.logging.Level.FINE)) {
                log.fine("WebSocket 연결 해제: 사용자 " + userId);
            }
        }
    }

    /**
     * 연결 활동 업데이트
     */
    public void updateConnectionActivity(String userId) {
        ConnectionInfo info = activeConnections.get(userId);
        if (info != null) {
            info.updateLastActivity();
        }
    }

    /**
     * 사용자가 온라인인지 확인
     */
    public boolean isUserOnline(String userId) {
        ConnectionInfo info = activeConnections.get(userId);
        if (info == null) {
            return false;
        }

        // 5분 이내에 활동이 있었다면 온라인으로 간주
        return info.isActiveWithin(5 * 60 * 1000); // 5분을 밀리초로 변환
    }

    /**
     * 현재 온라인 사용자 목록
     */
    public Set<String> getOnlineUsers() {
        return activeConnections.keySet();
    }

    /**
     * 비활성 연결 정리
     */
    private void cleanupStaleConnections() {
        long currentTime = System.currentTimeMillis();
        long staleThreshold = 10 * 60 * 1000; // 10분

        activeConnections.entrySet().removeIf(entry -> {
            ConnectionInfo info = entry.getValue();
            boolean isStale = currentTime - info.getLastActivityTime() > staleThreshold;

            if (isStale) {
                if (log.isLoggable(java.util.logging.Level.FINE)) {
                    log.fine("비활성 연결 정리: 사용자 " + entry.getKey());
                }
                totalDisconnections.incrementAndGet();
            }

            return isStale;
        });
    }

    /**
     * 연결을 비활성으로 표시
     */
    private void markConnectionAsInactive(String userId) {
        ConnectionInfo info = activeConnections.get(userId);
        if (info != null) {
            info.markAsInactive();
        }
    }

    /**
     * 시스템 상태 브로드캐스트 전송 여부 결정
     */
    private boolean shouldSendHealthBroadcast() {
        // 현재는 비활성화 (필요 시 활성화)
        return false;
    }

    /**
     * 시스템 상태 브로드캐스트
     */
    private void sendHealthBroadcast() {
        WsEnvelope<Map<String, Object>> healthMessage = new WsEnvelope<>(
                "system.health",
                WsEnvelope.newMessageId(),
                System.currentTimeMillis(),
                Map.of(
                        "activeConnections", activeConnections.size(),
                        "serverTime", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                        "uptime", getUptimeInfo()
                )
        );

        messagingTemplate.convertAndSend("/topic/system", healthMessage);
    }

    /**
     * 서버 가동 시간 정보
     */
    private String getUptimeInfo() {
        // 간단한 가동 시간 정보 (실제로는 더 정확한 계산 필요)
        return "Server is running";
    }

    /**
     * WebSocket 상태 통계 조회
     */
    public WebSocketStats getWebSocketStats() {
        return new WebSocketStats(
                activeConnections.size(),
                totalConnections.get(),
                totalDisconnections.get(),
                lastHealthCheckTime,
                userRegistry.getUserCount()
        );
    }

    /**
     * 특정 사용자에게 시스템 메시지 전송
     */
    public boolean sendSystemMessageToUser(String userId, String messageType, Object payload) {
        try {
            WsEnvelope<Object> systemMessage = new WsEnvelope<>(
                    messageType,
                    WsEnvelope.newMessageId(),
                    System.currentTimeMillis(),
                    payload
            );

            messagingTemplate.convertAndSendToUser(userId, "/queue/system", systemMessage);
            updateConnectionActivity(userId);

            return true;
        } catch (Exception e) {
            log.warning("사용자 " + userId + "에게 시스템 메시지 전송 실패: " + e.getMessage());
            return false;
        }
    }

    /**
     * 모든 사용자에게 시스템 알림 전송
     */
    public void broadcastSystemNotification(String message, String type) {
        WsEnvelope<Map<String, Object>> notification = new WsEnvelope<>(
                "system.notification",
                WsEnvelope.newMessageId(),
                System.currentTimeMillis(),
                Map.of(
                        "message", message,
                        "type", type,
                        "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                )
        );

        messagingTemplate.convertAndSend("/topic/system", notification);
        if (log.isLoggable(java.util.logging.Level.FINE)) {
            log.fine("시스템 알림 브로드캐스트: " + message);
        }
    }

    /**
     * 연결 정보 클래스
     */
    private static class ConnectionInfo {
        private final String userId;
        private final String sessionId;
        private final long connectedAt;
        private long lastActivityTime;
        private boolean isActive;

        public ConnectionInfo(String userId, String sessionId) {
            this.userId = userId;
            this.sessionId = sessionId;
            this.connectedAt = System.currentTimeMillis();
            this.lastActivityTime = System.currentTimeMillis();
            this.isActive = true;
        }

        public void updateLastActivity() {
            this.lastActivityTime = System.currentTimeMillis();
            this.isActive = true;
        }

        public void markAsInactive() {
            this.isActive = false;
        }

        public boolean isActiveWithin(long milliseconds) {
            return isActive && (System.currentTimeMillis() - lastActivityTime) < milliseconds;
        }

        public long getLastActivityTime() {
            return lastActivityTime;
        }

        public String getUserId() { return userId; }
        public String getSessionId() { return sessionId; }
        public long getConnectedAt() { return connectedAt; }
        public boolean isActive() { return isActive; }
    }

    /**
     * WebSocket 통계 DTO
     */
    public static class WebSocketStats {
        private final int activeConnections;
        private final int totalConnections;
        private final int totalDisconnections;
        private final LocalDateTime lastHealthCheckTime;
        private final int registeredUsers;

        public WebSocketStats(int activeConnections, int totalConnections, int totalDisconnections,
                             LocalDateTime lastHealthCheckTime, int registeredUsers) {
            this.activeConnections = activeConnections;
            this.totalConnections = totalConnections;
            this.totalDisconnections = totalDisconnections;
            this.lastHealthCheckTime = lastHealthCheckTime;
            this.registeredUsers = registeredUsers;
        }

        public int getActiveConnections() { return activeConnections; }
        public int getTotalConnections() { return totalConnections; }
        public int getTotalDisconnections() { return totalDisconnections; }
        public LocalDateTime getLastHealthCheckTime() { return lastHealthCheckTime; }
        public int getRegisteredUsers() { return registeredUsers; }
    }
}