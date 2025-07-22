package com.kob_backend_seoin.kob_backend.controller;

import com.kob_backend_seoin.kob_backend.dto.ApiResponse;
import com.kob_backend_seoin.kob_backend.dto.ProfileResponseDto;
import com.kob_backend_seoin.kob_backend.dto.ProfileUpdateRequestDto;
import com.kob_backend_seoin.kob_backend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/v1")
public class ProfileController {
    private final ProfileService profileService;

    @Autowired
    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    // 2.1. 특정 사용자 프로필 조회
    @GetMapping("/profiles/{userId}")
    public ResponseEntity<ApiResponse<ProfileResponseDto>> getProfile(@PathVariable String userId) {
        ProfileResponseDto dto = profileService.getProfileByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, dto, "프로필 조회에 성공했습니다."));
    }

    // 2.2. 내 프로필 수정 (userId는 JWT에서 추출)
    @PutMapping("/profiles/me")
    public ResponseEntity<ApiResponse<ProfileResponseDto>> updateMyProfile(
            @RequestBody ProfileUpdateRequestDto requestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) authentication.getPrincipal();
        ProfileResponseDto dto = profileService.updateMyProfile(userId, requestDto);
        return ResponseEntity.ok(new ApiResponse<>(true, dto, "프로필이 성공적으로 수정되었습니다."));
    }

    // 2.3. 이력서 목록 조회 (페이지네이션)
    @GetMapping("/resumes")
    public ResponseEntity<ApiResponse<Object>> getResumeList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String query) {
        Page<ProfileResponseDto> result = profileService.getResumeList(page, size, query);
        var data = new java.util.HashMap<String, Object>();
        data.put("totalElements", result.getTotalElements());
        data.put("totalPages", result.getTotalPages());
        data.put("currentPage", result.getNumber() + 1);
        data.put("content", result.getContent());
        return ResponseEntity.ok(new ApiResponse<>(true, data, "이력서 목록을 성공적으로 조회했습니다."));
    }
} 