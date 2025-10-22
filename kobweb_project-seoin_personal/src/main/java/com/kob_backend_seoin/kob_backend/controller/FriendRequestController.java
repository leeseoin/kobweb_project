package com.kob_backend_seoin.kob_backend.controller;

import com.kob_backend_seoin.kob_backend.dto.ApiResponse;
import com.kob_backend_seoin.kob_backend.domain.FriendRequest;
import com.kob_backend_seoin.kob_backend.service.FriendRequestService;
import com.kob_backend_seoin.kob_backend.service.JwtProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/friend-requests")
@Tag(name = "Friend Request", description = "친구 요청 관련 API")
public class FriendRequestController {

    private final FriendRequestService friendRequestService;
    private final JwtProvider jwtProvider;

    @Autowired
    public FriendRequestController(FriendRequestService friendRequestService, JwtProvider jwtProvider) {
        this.friendRequestService = friendRequestService;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping("/{requestId}/accept")
    @Operation(summary = "친구 요청 수락", description = "받은 친구 요청을 수락합니다.")
    public ResponseEntity<ApiResponse<String>> acceptFriendRequest(
            @RequestHeader("Authorization") String token,
            @PathVariable UUID requestId) {

        UUID userId = extractUserIdFromToken(token);
        friendRequestService.acceptFriendRequest(requestId, userId);

        return ResponseEntity.ok(new ApiResponse<>(true, "SUCCESS", "친구 요청을 수락했습니다."));
    }

    @PostMapping("/{requestId}/reject")
    @Operation(summary = "친구 요청 거절", description = "받은 친구 요청을 거절합니다.")
    public ResponseEntity<ApiResponse<String>> rejectFriendRequest(
            @RequestHeader("Authorization") String token,
            @PathVariable UUID requestId) {

        UUID userId = extractUserIdFromToken(token);
        friendRequestService.rejectFriendRequest(requestId, userId);

        return ResponseEntity.ok(new ApiResponse<>(true, "SUCCESS", "친구 요청을 거절했습니다."));
    }

    @PostMapping("/{requestId}/cancel")
    @Operation(summary = "친구 요청 취소", description = "보낸 친구 요청을 취소합니다.")
    public ResponseEntity<ApiResponse<String>> cancelFriendRequest(
            @RequestHeader("Authorization") String token,
            @PathVariable UUID requestId) {

        UUID userId = extractUserIdFromToken(token);
        friendRequestService.cancelFriendRequest(requestId, userId);

        return ResponseEntity.ok(new ApiResponse<>(true, "SUCCESS", "친구 요청을 취소했습니다."));
    }

    @GetMapping("/received")
    @Operation(summary = "받은 친구 요청 목록", description = "내가 받은 대기 중인 친구 요청 목록을 조회합니다.")
    public ResponseEntity<ApiResponse<List<FriendRequest>>> getReceivedRequests(
            @RequestHeader("Authorization") String token) {

        UUID userId = extractUserIdFromToken(token);
        List<FriendRequest> requests = friendRequestService.getReceivedRequests(userId);

        return ResponseEntity.ok(new ApiResponse<>(true, requests, "받은 친구 요청 목록을 조회했습니다."));
    }

    @GetMapping("/sent")
    @Operation(summary = "보낸 친구 요청 목록", description = "내가 보낸 대기 중인 친구 요청 목록을 조회합니다.")
    public ResponseEntity<ApiResponse<List<FriendRequest>>> getSentRequests(
            @RequestHeader("Authorization") String token) {

        UUID userId = extractUserIdFromToken(token);
        List<FriendRequest> requests = friendRequestService.getSentRequests(userId);

        return ResponseEntity.ok(new ApiResponse<>(true, requests, "보낸 친구 요청 목록을 조회했습니다."));
    }

    // JWT 토큰에서 userId 추출하는 메서드
    private UUID extractUserIdFromToken(String token) {
        try {
            System.out.println("=== extractUserIdFromToken 시작 ===");
            System.out.println("입력 토큰: " + (token != null ? token.substring(0, Math.min(50, token.length())) + "..." : "null"));

            // 토큰이 null이거나 비어있으면 에러
            if (token == null || token.trim().isEmpty()) {
                System.out.println("토큰이 null이거나 비어있음");
                throw new RuntimeException("토큰이 제공되지 않았습니다.");
            }

            // 모든 "Bearer " 접두사 제거 (중복된 경우 처리)
            while (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            System.out.println("Bearer 제거 후 토큰: " + (token != null ? token.substring(0, Math.min(50, token.length())) + "..." : "null"));

            // JWT 토큰 검증 및 디코딩
            var decodedJWT = jwtProvider.verifyToken(token);
            String userId = decodedJWT.getSubject();
            System.out.println("JWT에서 추출된 userId: " + userId);

            UUID result = UUID.fromString(userId);
            System.out.println("UUID 변환 성공: " + result);
            return result;

        } catch (Exception e) {
            System.out.println("extractUserIdFromToken 에러: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("유효하지 않은 토큰입니다.", e);
        }
    }
}