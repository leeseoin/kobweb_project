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

        // SimpleBroker - 테스트 완료, RabbitMQ로 전환
        // var broker = registry.enableSimpleBroker("/topic", "/queue");
        // broker.setTaskScheduler(wsHeartbeatTaskScheduler());
        // broker.setHeartbeatValue(new long[]{10000, 10000});

        // 🔥 RabbitMQ STOMP Broker Relay 사용 (Scale-out 지원)
        registry.enableStompBrokerRelay("/topic", "/queue")
                .setRelayHost("localhost")
                .setRelayPort(61613) // RabbitMQ STOMP 플러그인 포트
                .setClientLogin("guest")
                .setClientPasscode("guest")
                .setSystemLogin("guest")
                .setSystemPasscode("guest")
                .setVirtualHost("/")
                .setTaskScheduler(wsHeartbeatTaskScheduler());

        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(org.springframework.messaging.simp.config.ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // CONNECT 시 handshake에서 저장한 Principal을 STOMP 세션에 설정
                    Object userPrincipal = accessor.getSessionAttributes().get("user");
                    if (userPrincipal instanceof UsernamePasswordAuthenticationToken) {
                        accessor.setUser((UsernamePasswordAuthenticationToken) userPrincipal);
                        if (log.isLoggable(java.util.logging.Level.FINE)) {
                            log.fine("STOMP CONNECT: Principal 설정됨 - " + ((UsernamePasswordAuthenticationToken) userPrincipal).getName());
                        }
                    } else {
                        log.warning("STOMP CONNECT: Principal을 찾을 수 없음");
                    }
                } else if (StompCommand.SEND.equals(accessor.getCommand())) {
                    // SEND 메시지에서 SessionAttributes에서 Principal 복원
                    Object userPrincipal = accessor.getSessionAttributes().get("user");
                    if (userPrincipal instanceof UsernamePasswordAuthenticationToken) {
                        accessor.setUser((UsernamePasswordAuthenticationToken) userPrincipal);
                        if (log.isLoggable(java.util.logging.Level.FINE) && accessor.getUser() == null) {
                            log.fine("STOMP SEND: Principal 복원 실패");
                        }
                    } else {
                        if (log.isLoggable(java.util.logging.Level.FINE)) {
                            log.fine("STOMP SEND: SessionAttributes에 user 정보 없음");
                        }
                    }
                }

                return message;
            }
        });
        log.info("WebSocket ChannelInterceptor 활성화");
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
            // 🔍 디버깅 정보 출력 (FINE 레벨로 변경)
            if (log.isLoggable(java.util.logging.Level.FINE)) {
                log.fine("=== Handshake 요청 분석 시작 ===");
                log.fine("Request URI: " + request.getURI());
                log.fine("Request Path: " + request.getURI().getPath());
                log.fine("Request Query: " + request.getURI().getQuery());
                log.fine("Request Headers: " + request.getHeaders());
            }
            
            // 쿼리 파라미터에서 token 추출
            String query = request.getURI().getQuery();
            log.info("=== JWT 핸드셰이크 인증 시작 ===");
            log.info("쿼리 파라미터: " + query);
            log.info("쿼리에 token 포함: " + (query != null && query.contains("token=")));

            String token = null;

            if (query != null && query.contains("token=")) {
                String[] params = query.split("&");
                log.info("파라미터 개수: " + params.length);

                for (int i = 0; i < params.length; i++) {
                    String param = params[i];
                    log.info("파라미터 " + i + ": " + param);

                    if (param.startsWith("token=")) {
                        token = java.net.URLDecoder.decode(param.substring(6), "UTF-8");
                        log.info("JWT 토큰 발견 (디코딩 후)");
                        log.info("토큰 길이: " + token.length() + "자");
                        log.info("토큰 시작: " + (token.length() > 20 ? token.substring(0, 20) + "..." : token));
                        break;
                    }
                }
            }

            if (token != null) {
                // Bearer 접두사 제거 (있다면)
                if (token.startsWith("Bearer ")) {
                    token = token.substring(7);
                    log.info("Bearer 접두사 제거됨");
                }

                try {
                    // JWT 검증 및 사용자 ID 추출
                    var decodedJWT = jwtProvider.verifyToken(token);
                    String userId = decodedJWT.getSubject();

                    log.info("JWT 검증 성공!");
                    log.info("User ID: " + userId);

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
                    log.info("Principal 설정됨: " + principal.getName());
                    log.info("Attributes 저장됨: " + attributes.keySet());
                    log.info("=========================");

                    return true;

                } catch (Exception jwtError) {
                    log.severe("JWT 검증 실패: " + jwtError.getMessage());
                    jwtError.printStackTrace();
                    return false; // JWT 검증 실패 시 연결 거부
                }
            }

            log.warning("Handshake에서 JWT 토큰을 찾을 수 없음 - 연결 거부");
            return false; // 토큰이 없으면 연결 거부
            
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
