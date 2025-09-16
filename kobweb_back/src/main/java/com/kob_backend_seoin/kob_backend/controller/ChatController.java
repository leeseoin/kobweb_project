package com.kob_backend_seoin.kob_backend.controller;

import com.kob_backend_seoin.kob_backend.dto.ApiResponse;
import com.kob_backend_seoin.kob_backend.dto.Chat.ChatMessageRequestDto;
import com.kob_backend_seoin.kob_backend.dto.Chat.ChatMessageResponseDto;
import com.kob_backend_seoin.kob_backend.dto.Chat.ChatRoomResponseDto;
import com.kob_backend_seoin.kob_backend.dto.Chat.InviteUserRequestDto;
import com.kob_backend_seoin.kob_backend.service.ChatService;
import com.kob_backend_seoin.kob_backend.service.JwtProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@Tag(name = "Chat", description = "채팅 관련 API")
public class ChatController {
    
    private final ChatService chatService;
    private final JwtProvider jwtProvider;

    @Autowired
    public ChatController(ChatService chatService, JwtProvider jwtProvider) {
        this.chatService = chatService;
        this.jwtProvider = jwtProvider;
    }

    // @GetMapping("/test-cache")
    // @Operation(summary = "캐시 테스트", description = "Spring Cache가 정상 작동하는지 테스트합니다.")
    // public ResponseEntity<ApiResponse<String>> testCache(@RequestParam String key) {
    //     System.out.println("=== ChatController.testCache 호출됨 ===");
    //     String result = chatService.testCache(key);
    //     return ResponseEntity.ok(new ApiResponse<>(true, result, "캐시 테스트 완료"));
    // }
    
    // @GetMapping("/debug-cache")
    // @Operation(summary = "캐시 디버깅", description = "Spring Cache 디버깅을 위한 엔드포인트입니다.")
    // public ResponseEntity<ApiResponse<String>> debugCache(@RequestParam String key) {
    //     System.out.println("=== ChatController.debugCache 호출됨 ===");
    //     System.out.println("Key: " + key);
    //     String result = chatService.debugCache(key);
    //     System.out.println("Result: " + result);
    //     return ResponseEntity.ok(new ApiResponse<>(true, result, "캐시 디버깅 완료"));
    // }
    
    // @GetMapping("/check-proxy")
    // @Operation(summary = "프록시 확인", description = "Spring Cache 프록시가 정상 작동하는지 확인합니다.")
    // public ResponseEntity<ApiResponse<String>> checkProxy() {
    //     System.out.println("=== ChatController.checkProxy 호출됨 ===");
    //     String result = chatService.checkCacheProxy();
    //     return ResponseEntity.ok(new ApiResponse<>(true, result, "프록시 확인 완료"));
    // }
    
    // Spring Cache 테스트 엔드포인트 (인증 불필요) - 비활성화
    // @GetMapping("/test-cache-simple")
    // @Operation(summary = "캐시 테스트", description = "Spring Cache가 정상 작동하는지 테스트합니다.")
    // public ResponseEntity<ApiResponse<String>> testCacheSimple(@RequestParam String key) {
    //     System.out.println("=== ChatController.testCacheSimple 호출됨 ===");
    //     String result = chatService.debugCache(key);
    //     return ResponseEntity.ok(new ApiResponse<>(true, result, "캐시 테스트 완료"));
    // }
    
    // 프록시를 통한 캐시 테스트 엔드포인트 - 비활성화
    // @GetMapping("/test-cache-proxy")
    // @Operation(summary = "프록시 캐시 테스트", description = "프록시를 통한 Spring Cache 테스트입니다.")
    // public ResponseEntity<ApiResponse<String>> testCacheProxy(@RequestParam String key) {
    //     System.out.println("=== ChatController.testCacheProxy 호출됨 ===");
    //     String result = chatService.debugCacheWithProxy(key);
    //     return ResponseEntity.ok(new ApiResponse<>(true, result, "프록시 캐시 테스트 완료"));
    // }
    
    // 수동 캐시 테스트 엔드포인트 - 비활성화
    // @GetMapping("/test-manual-cache")
    // @Operation(summary = "수동 캐시 테스트", description = "RedisTemplate을 직접 사용한 수동 캐시 테스트")
    // public ResponseEntity<ApiResponse<String>> testManualCache(@RequestParam String key) {
    //     System.out.println("=== ChatController.testManualCache 호출됨 ===");
    //     String result = chatService.manualCacheTest(key);
    //     return ResponseEntity.ok(new ApiResponse<>(true, result, "수동 캐시 테스트 완료"));
    // }

    // @GetMapping("/test-spring-cache")
    // @Operation(summary = "Spring Cache 테스트", description = "@Cacheable을 사용한 Spring Cache 테스트")
    // public ResponseEntity<ApiResponse<String>> testSpringCache(@RequestParam String key) {
    //     System.out.println("=== ChatController.testSpringCache 호출됨 ===");
    //     String result = chatService.debugCache(key);
    //     return ResponseEntity.ok(new ApiResponse<>(true, result, "Spring Cache 테스트 완료"));
    // }

    // @GetMapping("/test-manual-cache-complex")
    // @Operation(summary = "복잡한 객체 수동 캐시 테스트", description = "List<DTO> 객체를 수동 캐시로 테스트")
    // public ResponseEntity<ApiResponse<String>> testManualCacheComplex(@RequestParam String key) {
    //     System.out.println("=== ChatController.testManualCacheComplex 호출됨 ===");
    //     
    //     // 복잡한 객체 생성 (List<DTO> 시뮬레이션)
    //     List<Map<String, Object>> complexData = List.of(
    //         Map.of("id", 1, "name", "Test User 1", "email", "user1@test.com"),
    //         Map.of("id", 2, "name", "Test User 2", "email", "user2@test.com"),
    //         Map.of("id", 3, "name", "Test User 3", "email", "user3@test.com")
    //     );
    //     
    //     String result = chatService.manualCacheTest(key);
    //     return ResponseEntity.ok(new ApiResponse<>(true, result, "복잡한 객체 수동 캐시 테스트 완료"));
    // }
    
    // 프록시 확인 테스트 (인증 불필요) - 비활성화
    // @GetMapping("/test-proxy")
    // @Operation(summary = "프록시 테스트", description = "Spring AOP 프록시가 정상 작동하는지 테스트합니다.")
    // public ResponseEntity<ApiResponse<String>> testProxy() {
    //     System.out.println("=== ChatController.testProxy 호출됨 ===");
    //     String result = chatService.checkCacheProxy();
    //     return ResponseEntity.ok(new ApiResponse<>(true, result, "프록시 테스트 완료"));
    // }

    @GetMapping("/rooms")
    @Operation(summary = "내 채팅방 목록 조회", description = "현재 사용자가 참여하고 있는 모든 채팅방 목록을 조회합니다.")
    public ResponseEntity<ApiResponse<List<ChatRoomResponseDto>>> getUserChatRooms(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        System.out.println("=== ChatController.getUserChatRooms 호출됨 ===");
        System.out.println("받은 토큰: " + (token != null ? token.substring(0, Math.min(50, token.length())) + "..." : "null"));
        
        UUID userId = extractUserIdFromToken(token);
        System.out.println("추출된 userId: " + userId);
        
        List<ChatRoomResponseDto> chatRooms = chatService.getUserChatRoomsList(userId, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, chatRooms, "채팅방 목록을 성공적으로 조회했습니다."));
    }

    @GetMapping("/rooms/{roomId}/messages")
    @Operation(summary = "특정 채팅방 메시지 내역 조회", description = "특정 채팅방의 이전 메시지 내역을 페이지네이션으로 조회합니다.")
    public ResponseEntity<ApiResponse<List<ChatMessageResponseDto>>> getChatRoomMessages(
            @RequestHeader("Authorization") String token,
            @PathVariable UUID roomId,
            @RequestParam(required = false) UUID lastMessageId,
            @RequestParam(defaultValue = "30") int size) {
        
        System.out.println("=== ChatController.getChatRoomMessages 호출됨 ===");
        System.out.println("roomId: " + roomId + ", lastMessageId: " + lastMessageId + ", size: " + size);
        
        UUID userId = extractUserIdFromToken(token);
        System.out.println("추출된 userId: " + userId);
        
        System.out.println("ChatService.getChatRoomMessagesList 호출 전");
        List<ChatMessageResponseDto> messages = chatService.getChatRoomMessagesList(userId, roomId, lastMessageId, size);
        System.out.println("ChatService.getChatRoomMessagesList 호출 후, 결과 크기: " + (messages != null ? messages.size() : "null"));
        
        return ResponseEntity.ok(new ApiResponse<>(true, messages, "메시지 내역을 성공적으로 조회했습니다."));
    }

    @PostMapping("/rooms/{roomId}/messages")
    @Operation(summary = "메시지 전송", description = "WebSocket 통신과 별개로, 전송된 메시지를 서버 DB에 기록합니다.")
    public ResponseEntity<ApiResponse<ChatMessageResponseDto>> sendMessage(
            @RequestHeader("Authorization") String token,
            @PathVariable UUID roomId,
            @RequestBody ChatMessageRequestDto requestDto) {
        
        UUID userId = extractUserIdFromToken(token);
        ChatMessageResponseDto message = chatService.sendMessage(userId, roomId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, message, "메시지를 성공적으로 전송했습니다."));
    }

    @PostMapping("/rooms")
    @Operation(summary = "1:1 채팅방 생성", description = "새로운 1:1 채팅방을 생성하거나 기존 채팅방을 반환합니다.")
    public ResponseEntity<ApiResponse<ChatRoomResponseDto>> createChatRoom(
            @RequestHeader("Authorization") String token,
            @RequestParam UUID participantId) {
        
        UUID userId = extractUserIdFromToken(token);
        ChatRoomResponseDto chatRoom = chatService.createChatRoom(userId, participantId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, chatRoom, "1:1 채팅방을 성공적으로 생성했습니다."));
    }

    @PostMapping("/rooms/group")
    @Operation(summary = "그룹 채팅방 생성", description = "새로운 그룹 채팅방을 생성합니다.")
    public ResponseEntity<ApiResponse<ChatRoomResponseDto>> createGroupChatRoom(
            @RequestHeader("Authorization") String token,
            @RequestParam String roomName,
            @RequestBody InviteUserRequestDto requestDto) {
        
        UUID userId = extractUserIdFromToken(token);
        ChatRoomResponseDto chatRoom = chatService.createGroupChatRoom(userId, roomName, requestDto.getUserIds());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, chatRoom, "그룹 채팅방을 성공적으로 생성했습니다."));
    }

    @PostMapping("/rooms/{roomId}/invite")
    @Operation(summary = "사용자 초대", description = "기존 채팅방에 사용자를 초대합니다.")
    public ResponseEntity<ApiResponse<ChatRoomResponseDto>> inviteUsers(
            @RequestHeader("Authorization") String token,
            @PathVariable UUID roomId,
            @RequestBody InviteUserRequestDto requestDto) {
        
        UUID userId = extractUserIdFromToken(token);
        ChatRoomResponseDto chatRoom = chatService.inviteUsers(userId, roomId, requestDto.getUserIds());
        return ResponseEntity.ok(new ApiResponse<>(true, chatRoom, "사용자를 성공적으로 초대했습니다."));
    }

    @DeleteMapping("/rooms/{roomId}/users/{userId}")
    @Operation(summary = "사용자 내보내기", description = "채팅방에서 사용자를 내보냅니다. (방장만 가능)")
    public ResponseEntity<ApiResponse<ChatRoomResponseDto>> removeUser(
            @RequestHeader("Authorization") String token,
            @PathVariable UUID roomId,
            @PathVariable UUID userId) {
        
        UUID removerId = extractUserIdFromToken(token);
        ChatRoomResponseDto chatRoom = chatService.removeUser(removerId, roomId, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, chatRoom, "사용자를 성공적으로 내보냈습니다."));
    }

    @PutMapping("/rooms/{roomId}/name")
    @Operation(summary = "채팅방 이름 변경", description = "채팅방 이름을 변경합니다. (방장만 가능)")
    public ResponseEntity<ApiResponse<ChatRoomResponseDto>> updateRoomName(
            @RequestHeader("Authorization") String token,
            @PathVariable UUID roomId,
            @RequestParam String newName) {
        
        UUID updaterId = extractUserIdFromToken(token);
        ChatRoomResponseDto chatRoom = chatService.updateRoomName(updaterId, roomId, newName);
        return ResponseEntity.ok(new ApiResponse<>(true, chatRoom, "채팅방 이름을 성공적으로 변경했습니다."));
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