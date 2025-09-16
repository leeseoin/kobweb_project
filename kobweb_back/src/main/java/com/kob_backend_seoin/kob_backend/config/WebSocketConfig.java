package com.kob_backend_seoin.kob_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import com.kob_backend_seoin.kob_backend.service.JwtProvider;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.logging.Logger;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.context.event.EventListener;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final Logger log = Logger.getLogger(WebSocketConfig.class.getName());

    @Autowired
    private JwtProvider jwtProvider;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 클라이언트에서 SockJS를 쓴다면 이 경로로 접속해야 합니다: http://localhost:8080/ws/chat
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("*")
                .addInterceptors(new JwtHandshakeInterceptor(jwtProvider)) // JWT 핸드셰이크 인터셉터 추가
                .withSockJS();

        // 순수 WebSocket(STOMP) 클라이언트용 엔드포인트 (ws://localhost:8080/ws/chat/raw)
        registry.addEndpoint("/ws/chat/raw")
                .setAllowedOriginPatterns("*")
                .addInterceptors(new JwtHandshakeInterceptor(jwtProvider)); // JWT 핸드셰이크 인터셉터 추가
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");

        var broker = registry.enableSimpleBroker("/topic", "/queue");
        broker.setTaskScheduler(wsHeartbeatTaskScheduler());
        broker.setHeartbeatValue(new long[]{10000, 10000});

        registry.setUserDestinationPrefix("/user");
    }

    // ★ Spring Security WebSocket 통합을 위해 ChannelInterceptor 제거
    @Override
    public void configureClientInboundChannel(org.springframework.messaging.simp.config.ChannelRegistration registration) {
        // Spring Security WebSocket 통합을 사용하여 Principal 동기화
        // 수동 ChannelInterceptor 구현 제거
        log.info("WebSocket Security 통합 모드 활성화");
    }

    @Bean
    public TaskScheduler wsHeartbeatTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("ws-heartbeat-");
        scheduler.initialize();
        return scheduler;
    }

    // @ServerEndpoint를 사용하지 않으므로 굳이 필요 없습니다. 충돌 방지 위해 제거 권장.
    // @Bean
    // public ServerEndpointExporter serverEndpointExporter() { return new ServerEndpointExporter(); }

    // STOMP 연결 이벤트: Principal이 제대로 세팅됐는지 확인용 로그
    @EventListener
    public void onSessionConnected(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        String user = accessor.getUser() != null ? accessor.getUser().getName() : "null";

        log.info("=== STOMP CONNECT 성공 ===");
        log.info("Session ID: " + sessionId);
        log.info("Principal: " + user);
        log.info("========================");
    }

    @EventListener
    public void onSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        String user = accessor.getUser() != null ? accessor.getUser().getName() : "null";

        log.info("=== STOMP DISCONNECT ===");
        log.info("Session ID: " + sessionId);
        log.info("Principal: " + user);
        log.info("========================");
    }
}



/** JWT Handshake Interceptor - SockJS 핸드셰이크 시 JWT 토큰 추출 */
class JwtHandshakeInterceptor implements org.springframework.web.socket.server.HandshakeInterceptor {
    
    private final JwtProvider jwtProvider;
    private static final Logger log = Logger.getLogger(JwtHandshakeInterceptor.class.getName());
    
    public JwtHandshakeInterceptor(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }
    
    @Override
    public boolean beforeHandshake(org.springframework.http.server.ServerHttpRequest request, 
                                   org.springframework.http.server.ServerHttpResponse response,
                                   org.springframework.web.socket.WebSocketHandler wsHandler, 
                                   java.util.Map<String, Object> attributes) {
        try {
            // 🔍 디버깅 정보 출력
            log.info("=== Handshake 요청 분석 시작 ===");
            log.info("Request URI: " + request.getURI());
            log.info("Request Path: " + request.getURI().getPath());
            log.info("Request Query: " + request.getURI().getQuery());
            log.info("Request Headers: " + request.getHeaders());
            
            // 쿼리 파라미터에서 token 추출
            String query = request.getURI().getQuery();
            log.info("쿼리 파라미터: " + query);
            log.info("쿼리에 token 포함: " + (query != null && query.contains("token=")));
            
            if (query != null && query.contains("token=")) {
                String[] params = query.split("&");
                log.info("파라미터 개수: " + params.length);
                for (int i = 0; i < params.length; i++) {
                    String param = params[i];
                    log.info("파라미터 " + i + ": " + param);
                    if (param.startsWith("token=")) {
                        String token = param.substring(6);
                        log.info("Handshake에서 JWT 토큰 발견: " + token.substring(0, 10) + "...");
                        log.info("토큰 길이: " + token.length() + "자");
                        
                        // JWT 검증 및 사용자 ID 추출
                        var decodedJWT = jwtProvider.verifyToken(token);
                        String userId = decodedJWT.getSubject();
                        
                        // attributes에 사용자 ID와 토큰 저장
                        attributes.put("userId", userId);
                        attributes.put("token", token);
                        
                        // Principal 생성하여 attributes에 저장 (핵심!)
                        var principal = new UsernamePasswordAuthenticationToken(
                                userId, null, List.of(new SimpleGrantedAuthority("USER"))
                        );
                        attributes.put("user", principal);
                        
                        // 추가 정보 저장
                        attributes.put("authenticated", true);
                        attributes.put("authorities", List.of(new SimpleGrantedAuthority("USER")));
                        
                        log.info("=== Handshake 인증 성공 ===");
                        log.info("User ID: " + userId);
                        log.info("Session Key: " + request.getHeaders().getFirst("Sec-WebSocket-Key"));
                        log.info("Principal 설정됨: " + principal.getName());
                        log.info("Attributes 저장됨: " + attributes.keySet());
                        log.info("=========================");
                        
                        return true;
                    }
                }
            }
            
            log.warning("Handshake에서 JWT 토큰을 찾을 수 없음");
            return true; // 토큰이 없어도 연결은 허용 (인증은 나중에)
            
        } catch (Exception e) {
            log.severe("Handshake JWT 인증 실패: " + e.getMessage());
            log.severe("연결 거부됨 - 유효하지 않은 JWT 토큰");
            return false; // JWT 인증 실패 시 연결 거부
        }
    }
    
    @Override
    public void afterHandshake(org.springframework.http.server.ServerHttpRequest request, 
                              org.springframework.http.server.ServerHttpResponse response,
                              org.springframework.web.socket.WebSocketHandler wsHandler, 
                              Exception exception) {
        // Handshake 완료 후 처리
    }
}
