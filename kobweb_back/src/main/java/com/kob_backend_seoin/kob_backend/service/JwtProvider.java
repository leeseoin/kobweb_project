package com.kob_backend_seoin.kob_backend.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.kob_backend_seoin.kob_backend.domain.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtProvider {
    private final String SECRET_KEY;
    private final long ACCESS_TOKEN_EXPIRE_MS = 1000 * 60 * 60; // 1시간
    private final long REFRESH_TOKEN_EXPIRE_MS = 1000L * 60 * 60 * 24 * 7; // 7일

    public JwtProvider(@Value("${jwt.secret:kob_secret_key_2024_default}") String secretKey) {
        this.SECRET_KEY = secretKey;
    }

    public String createAccessToken(String userId, String email) {
        return JWT.create()
                .withSubject(userId)
                .withClaim("email", email)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRE_MS))
                .sign(Algorithm.HMAC256(SECRET_KEY));
    }

    public String createRefreshToken(String userId) {
        return JWT.create()
                .withSubject(userId)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRE_MS))
                .sign(Algorithm.HMAC256(SECRET_KEY));
    }

    public DecodedJWT verifyToken(String token) throws JWTVerificationException {
        System.out.println("=== JWT 토큰 검증 디버깅 ===");
        System.out.println("사용 중인 SECRET_KEY: " + SECRET_KEY);
        System.out.println("검증할 토큰: " + token.substring(0, Math.min(50, token.length())) + "...");
        
        JWTVerifier verifier = JWT.require(Algorithm.HMAC256(SECRET_KEY)).build();
        return verifier.verify(token);
    }

    // User 객체를 받는 편의 메서드들 (OAuth2에서 사용)
    public String generateAccessToken(User user) {
        return createAccessToken(user.getId().toString(), user.getEmail());
    }

    public String generateRefreshToken(User user) {
        return createRefreshToken(user.getId().toString());
    }

    public boolean isTokenExpired(String token) {
        try {
            DecodedJWT decodedJWT = verifyToken(token);
            return decodedJWT.getExpiresAt().before(new Date());
        } catch (Exception e) {
            return true; // 토큰 검증 실패 시 만료된 것으로 간주
        }
    }
} 