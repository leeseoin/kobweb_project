package com.kob_backend_seoin.kob_backend.controller;

import com.kob_backend_seoin.kob_backend.dto.ApiResponse;
import com.kob_backend_seoin.kob_backend.dto.Resume.ResumeRequestDto;
import com.kob_backend_seoin.kob_backend.dto.Resume.ResumeResponseDto;
import com.kob_backend_seoin.kob_backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {
    private final ResumeService resumeService;

    @Autowired
    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    // 2.4. 이력서 등록
    @PostMapping
    public ResponseEntity<ApiResponse<ResumeResponseDto>> createResume(@RequestBody ResumeRequestDto requestDto) {
        UUID userId = getUserIdFromAuth();
        ResumeResponseDto responseDto = resumeService.createResume(userId, requestDto);
        return ResponseEntity.status(201)
            .body(new ApiResponse<>(true, responseDto, "이력서가 성공적으로 등록되었습니다."));
    }

    // 2.5. 이력서 수정
    @PutMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<ResumeResponseDto>> updateResume(
            @PathVariable String resumeId,
            @RequestBody ResumeRequestDto requestDto) {
        UUID userId = getUserIdFromAuth();
        ResumeResponseDto responseDto = resumeService.updateResume(userId, UUID.fromString(resumeId), requestDto);
        return ResponseEntity.ok(new ApiResponse<>(true, responseDto, "이력서가 성공적으로 수정되었습니다."));
    }

    // 2.6. 이력서 삭제
    @DeleteMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<Void>> deleteResume(@PathVariable String resumeId) {
        UUID userId = getUserIdFromAuth();
        resumeService.deleteResume(userId, UUID.fromString(resumeId));
        return ResponseEntity.ok(new ApiResponse<>(true, null, "이력서가 성공적으로 삭제되었습니다."));
    }

    // 이력서 조회
    @GetMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<ResumeResponseDto>> getResume(@PathVariable String resumeId) {
        UUID userId = getUserIdFromAuth();
        ResumeResponseDto responseDto = resumeService.getResume(userId, UUID.fromString(resumeId));
        return ResponseEntity.ok(new ApiResponse<>(true, responseDto, "이력서 조회에 성공했습니다."));
    }

    private UUID getUserIdFromAuth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString((String) authentication.getPrincipal());
    }
}
