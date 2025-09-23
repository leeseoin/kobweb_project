package com.kob_backend_seoin.kob_backend.config;

import com.kob_backend_seoin.kob_backend.service.JwtProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // OAuth2 관련 설정은 별도 클래스에서 처리

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtProvider jwtProvider, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/v3/api-docs.yaml",
                    "/swagger-resources/**", "/webjars/**",
                    "/api/users/**", "/api/v1/users/**",
                    "/actuator/health", // Health check 허용
                    "/ws/**", "/ws/chat/**", "/topic/**", "/queue/**",
                    "/websocket-test.html", "/test-stomp.html", "/static/**", "/css/**", "/js/**", "/images/**",
                    "/*.html" // 루트의 HTML 파일만 허용
                ).permitAll()
                .anyRequest().authenticated()
            )
            // OAuth2 로그인 설정은 별도 설정 클래스에서 처리
            // .oauth2Login() - OAuth2 관련 클래스 로딩 문제로 인해 주석 처리
            .addFilterBefore(new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
} 