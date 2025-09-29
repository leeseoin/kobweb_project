package com.kob_backend_seoin.kob_backend.config;

import com.kob_backend_seoin.kob_backend.service.WebSocketHealthCheckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.security.Principal;
import java.util.logging.Logger;

@Component
public class WebSocketEventListener {

    private static final Logger log = Logger.getLogger(WebSocketEventListener.class.getName());

    private final WebSocketHealthCheckService healthCheckService;

    @Autowired
    public WebSocketEventListener(WebSocketHealthCheckService healthCheckService) {
        this.healthCheckService = healthCheckService;
    }

    /**
     * WebSocket 연결 이벤트 처리
     */
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        Principal user = headerAccessor.getUser();

        if (user != null) {
            String userId = user.getName();
            healthCheckService.registerConnection(userId, sessionId);

            log.info("새 WebSocket 연결: 사용자 " + userId + ", 세션 " + sessionId);

            // 연결 환영 메시지 전송 (선택적)
            healthCheckService.sendSystemMessageToUser(userId, "system.connected",
                java.util.Map.of(
                    "message", "WebSocket 연결이 성공적으로 설정되었습니다",
                    "sessionId", sessionId
                )
            );
        } else {
            log.warning("인증되지 않은 WebSocket 연결 시도: 세션 " + sessionId);
        }
    }

    /**
     * WebSocket 연결 해제 이벤트 처리
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        Principal user = headerAccessor.getUser();

        if (user != null) {
            String userId = user.getName();
            healthCheckService.unregisterConnection(userId);

            log.info("WebSocket 연결 해제: 사용자 " + userId + ", 세션 " + sessionId);
        } else {
            log.info("익명 WebSocket 연결 해제: 세션 " + sessionId);
        }
    }

    /**
     * 채널 구독 이벤트 처리
     */
    @EventListener
    public void handleSubscriptionEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String destination = headerAccessor.getDestination();
        Principal user = headerAccessor.getUser();

        if (user != null) {
            String userId = user.getName();
            healthCheckService.updateConnectionActivity(userId);

            log.info("채널 구독: 사용자 " + userId + ", 대상 " + destination + ", 세션 " + sessionId);
        } else {
            log.warning("인증되지 않은 채널 구독 시도: 대상 " + destination + ", 세션 " + sessionId);
        }
    }

    /**
     * 채널 구독 해제 이벤트 처리
     */
    @EventListener
    public void handleUnsubscriptionEvent(SessionUnsubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        Principal user = headerAccessor.getUser();

        if (user != null) {
            String userId = user.getName();
            healthCheckService.updateConnectionActivity(userId);

            log.info("채널 구독 해제: 사용자 " + userId + ", 세션 " + sessionId);
        }
    }
}