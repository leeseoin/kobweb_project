package com.kob_backend_seoin.kob_backend.service;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.kob_backend_seoin.kob_backend.exception.CustomException;
import com.kob_backend_seoin.kob_backend.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

/**
 * WebSocket 인증을 위한 통합 서비스
 * JWT 토큰 검증과 Principal 설정을 한 곳에서 관리
 */
@Service
public class WebSocketAuthService {

    private static final Logger log = Logger.getLogger(WebSocketAuthService.class.getName());

    private final JwtProvider jwtProvider;

    @Autowired
    public WebSocketAuthService(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    /**
     * WebSocket 연결 시 JWT 토큰을 검증하고 Principal을 생성합니다.
     * 
     * @param token JWT 토큰
     * @return 생성된 Principal
     * @throws ChatException 토큰이 유효하지 않은 경우
     */
    public Principal createPrincipalFromToken(String token) throws CustomException {
        if (token == null || token.trim().isEmpty()) {
            throw new CustomException("JWT 토큰이 없습니다", ErrorCode.UNAUTHORIZED);
        }

        try {
            // Bearer 접두사 제거
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            // JWT 토큰 검증
            DecodedJWT decodedJWT = jwtProvider.verifyToken(token);
            
            // 토큰 만료 확인
            if (jwtProvider.isTokenExpired(token)) {
                throw new CustomException("JWT 토큰이 만료되었습니다", ErrorCode.UNAUTHORIZED);
            }

            String userId = decodedJWT.getSubject();
            if (userId == null || userId.trim().isEmpty()) {
                throw new CustomException("JWT 토큰에 사용자 ID가 없습니다", ErrorCode.UNAUTHORIZED);
            }

            // Principal 생성
            Principal principal = new UsernamePasswordAuthenticationToken(
                    userId, 
                    null, 
                    List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("USER"))
            );

            log.info("WebSocket 인증 성공: 사용자 " + userId);
            return principal;

        } catch (Exception e) {
            log.warning("WebSocket JWT 토큰 검증 실패: " + e.getMessage());
            throw new CustomException("JWT 토큰 검증 실패: " + e.getMessage(), ErrorCode.UNAUTHORIZED);
        }
    }

    /**
     * Principal에서 사용자 ID를 추출하고 검증합니다.
     * 
     * @param principal 인증된 Principal
     * @return 사용자 ID (UUID)
     * @throws CustomException Principal이 유효하지 않은 경우
     */
    public UUID extractUserId(Principal principal) throws CustomException {
        if (principal == null) {
            throw new CustomException("Principal이 없습니다", ErrorCode.UNAUTHORIZED);
        }

        try {
            String userId = principal.getName();
            if (userId == null || userId.trim().isEmpty()) {
                throw new CustomException("사용자 ID가 없습니다", ErrorCode.UNAUTHORIZED);
            }
            
            return UUID.fromString(userId);
        } catch (IllegalArgumentException e) {
            throw new CustomException("유효하지 않은 사용자 ID 형식: " + e.getMessage(), ErrorCode.UNAUTHORIZED);
        }
    }

    /**
     * WebSocket 메시지에서 Principal을 검증하고 사용자 ID를 추출합니다.
     * SessionAttributes에서 Principal을 복원하는 로직을 포함합니다.
     * 
     * @param principal 현재 Principal (null일 수 있음)
     * @param headerAccessor WebSocket 메시지 헤더 접근자
     * @return 사용자 ID (UUID)
     * @throws CustomException 인증 실패 시
     */
    public UUID validateAndExtractUserId(Principal principal, SimpMessageHeaderAccessor headerAccessor) throws CustomException {
        // 1. Principal이 있으면 직접 사용
        if (principal != null) {
            return extractUserId(principal);
        }

        // 2. SessionAttributes에서 Principal 복원 시도
        Principal restoredPrincipal = restorePrincipalFromSession(headerAccessor);
        if (restoredPrincipal != null) {
            return extractUserId(restoredPrincipal);
        }

        // 3. SessionAttributes에서 토큰을 추출하여 새로 인증
        String token = extractTokenFromSession(headerAccessor);
        if (token != null) {
            Principal newPrincipal = createPrincipalFromToken(token);
            // SessionAttributes에 저장
            storePrincipalInSession(headerAccessor, newPrincipal);
            return extractUserId(newPrincipal);
        }

        throw new CustomException("WebSocket 인증 실패: Principal과 토큰을 찾을 수 없습니다", ErrorCode.UNAUTHORIZED);
    }

    /**
     * SessionAttributes에서 Principal을 복원합니다.
     */
    private Principal restorePrincipalFromSession(SimpMessageHeaderAccessor headerAccessor) {
        try {
            var sessionAttributes = headerAccessor.getSessionAttributes();
            if (sessionAttributes != null && sessionAttributes.containsKey("user")) {
                Object userObj = sessionAttributes.get("user");
                if (userObj instanceof Principal) {
                    Principal restoredPrincipal = (Principal) userObj;
                    if (log.isLoggable(java.util.logging.Level.FINE)) {
                        log.fine("SessionAttributes에서 Principal 복원 성공: " + restoredPrincipal.getName());
                    }
                    return restoredPrincipal;
                }
            }
        } catch (Exception e) {
            log.warning("Principal 복원 중 오류: " + e.getMessage());
        }
        return null;
    }

    /**
     * SessionAttributes에서 JWT 토큰을 추출합니다.
     */
    private String extractTokenFromSession(SimpMessageHeaderAccessor headerAccessor) {
        try {
            var sessionAttributes = headerAccessor.getSessionAttributes();
            if (sessionAttributes != null) {
                Object token = sessionAttributes.get("token");
                if (token instanceof String) {
                    return (String) token;
                }
            }
        } catch (Exception e) {
            log.warning("세션에서 토큰 추출 실패: " + e.getMessage());
        }
        return null;
    }

    /**
     * Principal을 SessionAttributes에 저장합니다.
     */
    private void storePrincipalInSession(SimpMessageHeaderAccessor headerAccessor, Principal principal) {
        try {
            var sessionAttributes = headerAccessor.getSessionAttributes();
            if (sessionAttributes != null) {
                sessionAttributes.put("user", principal);
                if (log.isLoggable(java.util.logging.Level.FINE)) {
                    log.fine("Principal을 SessionAttributes에 저장: " + principal.getName());
                }
            }
        } catch (Exception e) {
            log.warning("Principal 저장 중 오류: " + e.getMessage());
        }
    }

    /**
     * JWT 토큰이 유효한지 확인합니다.
     * 
     * @param token JWT 토큰
     * @return 유효한 경우 true
     */
    public boolean isTokenValid(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }

        try {
            // Bearer 접두사 제거
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            // JWT 토큰 검증
            jwtProvider.verifyToken(token);
            return !jwtProvider.isTokenExpired(token);
        } catch (Exception e) {
            if (log.isLoggable(java.util.logging.Level.FINE)) {
                log.fine("JWT 토큰 검증 실패: " + e.getMessage());
            }
            return false;
        }
    }
}
