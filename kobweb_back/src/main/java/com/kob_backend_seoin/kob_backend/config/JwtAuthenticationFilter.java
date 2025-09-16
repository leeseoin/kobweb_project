package com.kob_backend_seoin.kob_backend.config;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.kob_backend_seoin.kob_backend.service.JwtProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtProvider jwtProvider;

    public JwtAuthenticationFilter(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        
        // 인증이 필요 없는 경로들은 JWT 필터를 건너뛰기
        if (requestURI.startsWith("/ws/") || 
            requestURI.startsWith("/swagger-ui") || 
            requestURI.startsWith("/v3/api-docs") ||
            requestURI.startsWith("/swagger-resources") ||
            requestURI.startsWith("/webjars") ||
            requestURI.endsWith(".html") ||
            requestURI.endsWith(".css") ||
            requestURI.endsWith(".js") ||
            requestURI.endsWith(".png") ||
            requestURI.endsWith(".jpg") ||
            requestURI.endsWith(".ico")) {
            System.out.println("JWT Filter - Public resource, skipping JWT filter: " + requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        // 회원가입과 로그인 경로는 JWT 필터를 건너뛰기
        if (requestURI.equals("/api/v1/users/signup") || 
            requestURI.equals("/api/v1/users/login")) {
            System.out.println("JWT Filter - Auth endpoint, skipping JWT filter: " + requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = resolveToken(request);
        System.out.println("JWT Filter - Request URI: " + requestURI);
        System.out.println("JWT Filter - Token: " + (token != null ? "Present" : "Not present"));
        
        if (token != null) {
            try {
                DecodedJWT decodedJWT = jwtProvider.verifyToken(token);
                String userId = decodedJWT.getSubject();
                System.out.println("JWT Filter - User ID: " + userId);
                
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("JWT Filter - Authentication set successfully");
            } catch (Exception e) {
                System.out.println("JWT Filter - Token verification failed: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        } else {
            System.out.println("JWT Filter - No token provided for protected endpoint: " + requestURI);
            // 토큰이 필요한 엔드포인트인 경우 401 반환
            if (requestURI.startsWith("/api/")) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer)) {
            // 모든 "Bearer " 접두사 제거 (중복된 경우 처리)
            while (bearer.startsWith("Bearer ")) {
                bearer = bearer.substring(7);
            }
            return bearer;
        }
        return null;
    }
} 