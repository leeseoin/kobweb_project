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
                           // "/api/chat/test-cache", "/api/chat/debug-cache", "/api/chat/check-proxy", 
                           // "/api/chat/test-cache-simple", "/api/chat/test-proxy", "/api/chat/test-cache-proxy", // 캐시 테스트 엔드포인트 허용 (비활성화)
                    "/ws/**", "/ws/chat/**", "/topic/**", "/queue/**",
                    "/websocket-test.html", "/test-stomp.html", "/static/**", "/css/**", "/js/**", "/images/**",
                    "/*.html" // 루트의 HTML 파일만 허용
                ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
} 