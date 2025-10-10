package com.kob_backend_seoin.kob_backend.controller;

import com.kob_backend_seoin.kob_backend.dto.ApiResponse;
import com.kob_backend_seoin.kob_backend.dto.BusinessCard.BusinessCardRequestDto;
import com.kob_backend_seoin.kob_backend.dto.BusinessCard.BusinessCardResponseDto;
import com.kob_backend_seoin.kob_backend.service.BusinessCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/business-cards")
public class BusinessCardController {
    private final BusinessCardService businessCardService;

    @Autowired
    public BusinessCardController(BusinessCardService businessCardService) {
        this.businessCardService = businessCardService;
    }

    // 3.1. 명함 등록 요청
    // Request Body의 email로 대상 사용자를 찾아서 명함 등록 요청을 보냅니다.
    // - 대상 사용자가 시스템에 가입되어 있으면: PENDING 상태로 저장 + 상대방에게 알림 전송
    // - 대상 사용자가 비가입자면: ACCEPTED 상태로 바로 저장
    // - 상대방이 수락하면: 양방향 명함 생성 + Neo4j 친구 관계 추가 + 채팅 가능
    @PostMapping
    public ResponseEntity<ApiResponse<BusinessCardResponseDto>> createBusinessCard(@RequestBody BusinessCardRequestDto requestDto) {
        UUID userId = getUserIdFromAuth();
        BusinessCardResponseDto dto = businessCardService.createBusinessCard(userId, requestDto);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, dto, "명함이 성공적으로 등록되었습니다."));
    }

    // 3.2. 내가 등록한 명함 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<BusinessCardResponseDto>>> getMyBusinessCards(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String company) {
        UUID userId = getUserIdFromAuth();
        List<BusinessCardResponseDto> list = businessCardService.getMyBusinessCards(userId, query, company);
        return ResponseEntity.ok(new ApiResponse<>(true, list, "명함 목록 조회에 성공했습니다."));
    }

    // 3.3. 특정 명함 상세 조회
    @GetMapping("/{businessCardId}")
    public ResponseEntity<ApiResponse<BusinessCardResponseDto>> getBusinessCard(@PathVariable String businessCardId) {
        UUID userId = getUserIdFromAuth();
        BusinessCardResponseDto dto = businessCardService.getBusinessCard(userId, UUID.fromString(businessCardId));
        return ResponseEntity.ok(new ApiResponse<>(true, dto, "명함 상세 정보 조회에 성공했습니다."));
    }

    // 3.4. 명함 정보 수정
    @PutMapping("/{businessCardId}")
    public ResponseEntity<ApiResponse<BusinessCardResponseDto>> updateBusinessCard(
            @PathVariable String businessCardId,
            @RequestBody BusinessCardRequestDto requestDto) {
        UUID userId = getUserIdFromAuth();
        BusinessCardResponseDto dto = businessCardService.updateBusinessCard(userId, UUID.fromString(businessCardId), requestDto);
        return ResponseEntity.ok(new ApiResponse<>(true, dto, "명함 정보가 성공적으로 수정되었습니다."));
    }

    // 3.5. 명함 삭제
    @DeleteMapping("/{businessCardId}")
    public ResponseEntity<ApiResponse<Void>> deleteBusinessCard(@PathVariable String businessCardId) {
        UUID userId = getUserIdFromAuth();
        businessCardService.deleteBusinessCard(userId, UUID.fromString(businessCardId));
        return ResponseEntity.ok(new ApiResponse<>(true, null, "명함이 성공적으로 삭제되었습니다."));
    }

    // 3.6. 명함 공유 링크 생성
    @PostMapping("/{businessCardId}/share")
    public ResponseEntity<ApiResponse<Map<String, Object>>> shareBusinessCard(@PathVariable String businessCardId) {
        UUID userId = getUserIdFromAuth();
        String url = businessCardService.createShareableUrl(userId, UUID.fromString(businessCardId));
        Map<String, Object> data = new HashMap<>();
        data.put("shareableUrl", url);
        data.put("expiresAt", null); // 실제 구현 시 만료시간 추가
        return ResponseEntity.ok(new ApiResponse<>(true, data, "명함 공유 링크가 생성되었습니다."));
    }

    // 3.7. 명함 등록 요청 수락
    @PostMapping("/{businessCardId}/accept")
    public ResponseEntity<ApiResponse<Void>> acceptBusinessCardRequest(@PathVariable String businessCardId) {
        UUID userId = getUserIdFromAuth();
        businessCardService.acceptBusinessCardRequest(UUID.fromString(businessCardId), userId);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "명함 등록 요청이 수락되었습니다."));
    }

    // 3.8. 명함 등록 요청 거절
    @PostMapping("/{businessCardId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectBusinessCardRequest(@PathVariable String businessCardId) {
        UUID userId = getUserIdFromAuth();
        businessCardService.rejectBusinessCardRequest(UUID.fromString(businessCardId), userId);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "명함 등록 요청이 거절되었습니다."));
    }

    private UUID getUserIdFromAuth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString((String) authentication.getPrincipal());
    }
} 