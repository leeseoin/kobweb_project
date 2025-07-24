package com.kob_backend_seoin.kob_backend.controller;

import com.kob_backend_seoin.kob_backend.dto.User.UserSignupResponseDto;
import com.kob_backend_seoin.kob_backend.dto.User.UserLoginResponseDto;
import com.kob_backend_seoin.kob_backend.dto.User.UserResponseDto;
import com.kob_backend_seoin.kob_backend.dto.User.UserSignupRequestDto;
import com.kob_backend_seoin.kob_backend.dto.User.UserUpdateRequestDto;
import com.kob_backend_seoin.kob_backend.dto.ApiResponse;
import com.kob_backend_seoin.kob_backend.dto.User.UserLoginRequestDto;
import com.kob_backend_seoin.kob_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserSignupResponseDto>> signup(@RequestBody UserSignupRequestDto requestDto) {
        UserSignupResponseDto responseDto = userService.signup(requestDto);
        return ResponseEntity.status(201)
            .body(new ApiResponse<>(true, responseDto, "회원가입이 성공적으로 완료되었습니다."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserLoginResponseDto>> login(@RequestBody UserLoginRequestDto requestDto) {
        UserLoginResponseDto responseDto = userService.login(requestDto);
        return ResponseEntity.ok(new ApiResponse<>(true, responseDto, "로그인에 성공했습니다."));
    }

    // 전체 사용자 조회
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserResponseDto> users = userService.getAllUsers();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", users);
            response.put("message", "사용자 목록을 성공적으로 조회했습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 단일 사용자 조회
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable String userId) {
        try {
            UserResponseDto user = userService.getUserById(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", user);
            response.put("message", "사용자 정보를 성공적으로 조회했습니다.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 사용자 정보 수정
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody UserUpdateRequestDto requestDto) {
        try {
            UserResponseDto updatedUser = userService.updateUser(userId, requestDto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updatedUser);
            response.put("message", "사용자 정보를 성공적으로 수정했습니다.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 사용자 삭제
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        try {
            userService.deleteUser(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "사용자를 성공적으로 삭제했습니다.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
} 