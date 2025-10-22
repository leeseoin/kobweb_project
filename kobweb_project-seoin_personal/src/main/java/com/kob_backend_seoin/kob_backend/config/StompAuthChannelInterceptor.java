package com.kob_backend_seoin.kob_backend.config;

import com.kob_backend_seoin.kob_backend.service.JwtProvider;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.logging.Logger;

/**
 * STOMP 메시지 인터셉터 - JWT 기반 인증 처리
 *
 * STOMP CONNECT 시점에 JWT 토큰을 검증하고 Principal을 설정합니다.
 * 이는 WebSocket Handshake와 STOMP 연결 사이의 인증 정보 유실 문제를 해결합니다.
 */
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final Logger log = Logger.getLogger(StompAuthChannelInterceptor.class.getName());

    private final JwtProvider jwtProvider;

    public StompAuthChannelInterceptor(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
        log.info("🚀 StompAuthChannelInterceptor 인스턴스 생성됨");
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // Heartbeat 메시지 필터링 (Command가 null인 경우는 대부분 Heartbeat)
        if (accessor.getCommand() == null) {
            // Heartbeat는 정상 동작이므로 로그 없이 그대로 통과
            return message;
        }

        // STOMP 명령어 로깅 (CONNECT, SEND, SUBSCRIBE 등만 로깅)
        log.info("📨 STOMP 명령어: " + accessor.getCommand() + " | Session: " + accessor.getSessionId());

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.info("=================================================================");
            log.info("🔐 STOMP CONNECT 인터셉터 시작");
            log.info("=================================================================");

            String token = null;

            // 방법 1: STOMP 헤더에서 Authorization 추출
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            log.info("🔍 Authorization 헤더 확인: " + (authHeader != null ? "존재 (길이: " + authHeader.length() + ")" : "❌ 없음"));

            if (authHeader != null) {
                token = authHeader;
                log.info("✅ STOMP 헤더에서 Authorization 토큰 발견!");
            }

            // 방법 2: SessionAttributes에서 토큰 복원 시도 (Fallback)
            if (token == null && accessor.getSessionAttributes() != null) {
                log.info("🔍 SessionAttributes에서 토큰 검색 시도...");
                Object tokenObj = accessor.getSessionAttributes().get("token");

                if (tokenObj instanceof String) {
                    token = (String) tokenObj;
                    log.info("✅ SessionAttributes에서 토큰 복원 성공!");
                } else {
                    log.warning("❌ SessionAttributes에 토큰 없음");
                    log.info("SessionAttributes 키 목록: " + accessor.getSessionAttributes().keySet());
                }
            }

            // 토큰 검증 및 Principal 설정
            if (token != null) {
                // Bearer 접두사 제거
                if (token.startsWith("Bearer ")) {
                    token = token.substring(7);
                    log.info("✂️ Bearer 접두사 제거됨");
                }

                log.info("🔐 JWT 토큰 검증 시작...");
                log.info("토큰 시작 부분: " + (token.length() > 30 ? token.substring(0, 30) + "..." : token));

                try {
                    // JWT 검증 및 사용자 ID 추출
                    var decodedJWT = jwtProvider.verifyToken(token);
                    String userId = decodedJWT.getSubject();

                    log.info("✅ JWT 검증 성공!");
                    log.info("📋 추출된 User ID: " + userId);

                    // Principal 생성 및 설정
                    var principal = new UsernamePasswordAuthenticationToken(
                        userId, null, List.of(new SimpleGrantedAuthority("USER"))
                    );
                    accessor.setUser(principal);

                    // SessionAttributes에도 저장 (SEND/SUBSCRIBE 메시지용)
                    if (accessor.getSessionAttributes() != null) {
                        accessor.getSessionAttributes().put("user", principal);
                        log.info("💾 Principal을 SessionAttributes에 저장됨");
                    }

                    log.info("=================================================================");
                    log.info("✅✅✅ STOMP CONNECT: Principal 설정 성공 - UserID: " + userId);
                    log.info("=================================================================");

                } catch (Exception e) {
                    log.severe("=================================================================");
                    log.severe("❌❌❌ JWT 검증 실패: " + e.getClass().getSimpleName());
                    log.severe("오류 메시지: " + e.getMessage());
                    log.severe("=================================================================");

                    // 스택 트레이스 출력
                    e.printStackTrace();

                    // 인증 실패 시 연결 거부
                    throw new RuntimeException("인증 실패: 유효하지 않은 JWT 토큰 - " + e.getMessage());
                }
            } else {
                log.severe("=================================================================");
                log.severe("❌❌❌ STOMP CONNECT: JWT 토큰을 찾을 수 없음!");
                log.severe("Authorization 헤더: " + (authHeader != null ? "존재하지만 null로 처리됨" : "없음"));
                log.severe("SessionAttributes: " + (accessor.getSessionAttributes() != null ? accessor.getSessionAttributes().keySet() : "null"));
                log.severe("=================================================================");

                // 인증 실패 시 연결 거부
                throw new RuntimeException("인증 실패: JWT 토큰 없음");
            }

        } else if (StompCommand.SEND.equals(accessor.getCommand()) ||
                   StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            // SEND/SUBSCRIBE 메시지에서 Principal 복원
            if (accessor.getUser() == null && accessor.getSessionAttributes() != null) {
                Object userPrincipal = accessor.getSessionAttributes().get("user");
                if (userPrincipal instanceof UsernamePasswordAuthenticationToken) {
                    accessor.setUser((UsernamePasswordAuthenticationToken) userPrincipal);
                    log.info("🔄 " + accessor.getCommand() + " 명령어: Principal 복원됨");
                } else {
                    log.warning("⚠️ " + accessor.getCommand() + " 명령어: Principal 복원 실패");
                }
            }
        }

        return message;
    }

    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
        // 메시지 전송 후 처리 (필요시 구현)
    }

    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        if (ex != null) {
            log.severe("❌ 메시지 전송 실패: " + ex.getMessage());
        }
    }
}
