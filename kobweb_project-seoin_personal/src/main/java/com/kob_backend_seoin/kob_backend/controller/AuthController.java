package com.kob_backend_seoin.kob_backend.controller;

import com.kob_backend_seoin.kob_backend.domain.User;
import com.kob_backend_seoin.kob_backend.service.JwtProvider;
import com.kob_backend_seoin.kob_backend.repository.UserRepository;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            // Bearer 토큰에서 JWT 추출
            String token = authHeader.replace("Bearer ", "");
            DecodedJWT decodedJWT = jwtProvider.verifyToken(token);

            // 사용자 ID로 사용자 정보 조회
            String userId = decodedJWT.getSubject();
            Optional<User> userOptional = userRepository.findById(UUID.fromString(userId));

            if (userOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOptional.get();

            // 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> userData = new HashMap<>();

            userData.put("id", user.getId().toString());
            userData.put("email", user.getEmail());
            userData.put("nickname", user.getNickname());
            userData.put("provider", user.getProvider());
            userData.put("profileImageUrl", user.getProfileImageUrl());
            userData.put("createdAt", user.getCreatedAt());

            response.put("success", true);
            response.put("data", userData);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "인증 토큰이 유효하지 않습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        // JWT는 stateless이므로 서버에서 할 일은 없음
        // 클라이언트에서 토큰을 제거하면 됨
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "로그아웃되었습니다.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/oauth/status")
    public ResponseEntity<Map<String, Object>> getOAuthStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("providers", new String[]{"google", "github"});
        response.put("message", "OAuth2 로그인이 활성화되어 있습니다.");
        return ResponseEntity.ok(response);
    }
}