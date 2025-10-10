package com.kob_backend_seoin.kob_backend.controller;

import com.kob_backend_seoin.kob_backend.dto.ApiResponse;
import com.kob_backend_seoin.kob_backend.dto.Network.NetworkNodeDto;
import com.kob_backend_seoin.kob_backend.dto.Network.NetworkResponseDto;
import com.kob_backend_seoin.kob_backend.service.NetworkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/network")
public class NetworkController {
    private final NetworkService networkService;

    @Autowired
    public NetworkController(NetworkService networkService) {
        this.networkService = networkService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<NetworkResponseDto>> getUserNetwork() {
        UUID userId = getUserIdFromAuth();
        NetworkResponseDto network = networkService.getUserNetwork(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, network, "네트워크 조회에 성공했습니다."));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<NetworkNodeDto>>> getRecommendedConnections() {
        UUID userId = getUserIdFromAuth();
        List<NetworkNodeDto> recommendations = networkService.getRecommendedConnections(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, recommendations, "추천 연결 조회에 성공했습니다."));
    }

    @PostMapping("/friends/{friendUserId}")
    public ResponseEntity<ApiResponse<Void>> addFriend(@PathVariable String friendUserId) {
        UUID userId = getUserIdFromAuth();
        networkService.addFriendConnection(userId, UUID.fromString(friendUserId));
        return ResponseEntity.ok(new ApiResponse<>(true, null, "친구 관계가 생성되었습니다."));
    }

    @DeleteMapping("/friends/{friendUserId}")
    public ResponseEntity<ApiResponse<Void>> removeFriend(@PathVariable String friendUserId) {
        UUID userId = getUserIdFromAuth();
        networkService.removeFriendConnection(userId, UUID.fromString(friendUserId));
        return ResponseEntity.ok(new ApiResponse<>(true, null, "친구 관계가 해제되었습니다."));
    }

    private UUID getUserIdFromAuth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString((String) authentication.getPrincipal());
    }
}