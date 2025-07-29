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
        String token = resolveToken(request);
        System.out.println("JWT Filter - Request URI: " + request.getRequestURI());
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
            System.out.println("JWT Filter - No token provided");
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