package com.kob_backend_seoin.kob_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kob_backend_seoin.kob_backend.domain.ChatMessage;
import com.kob_backend_seoin.kob_backend.domain.ChatRoom;
import com.kob_backend_seoin.kob_backend.domain.User;
import com.kob_backend_seoin.kob_backend.dto.Chat.ChatMessageRequestDto;
import com.kob_backend_seoin.kob_backend.dto.Chat.WebSocketMessageDto;
import com.kob_backend_seoin.kob_backend.dto.Chat.WsEnvelope;
import com.kob_backend_seoin.kob_backend.exception.CustomException;
import com.kob_backend_seoin.kob_backend.exception.ErrorCode;
import com.kob_backend_seoin.kob_backend.repository.ChatMessageRepository;
import com.kob_backend_seoin.kob_backend.repository.ChatRoomRepository;
import com.kob_backend_seoin.kob_backend.repository.UserRepository;
import com.kob_backend_seoin.kob_backend.service.JwtProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Controller
public class WebSocketChatController {

    private static final Logger log = Logger.getLogger(WebSocketChatController.class.getName());
    

    
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final ObjectMapper objectMapper;

    @Autowired
    public WebSocketChatController(SimpMessagingTemplate messagingTemplate,
                                 ChatMessageRepository chatMessageRepository,
                                 ChatRoomRepository chatRoomRepository,
                                 UserRepository userRepository,
                                 JwtProvider jwtProvider,
                                 ObjectMapper objectMapper) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
        this.objectMapper = objectMapper;
    }

    @MessageMapping("/create-room")
    public void createRoom(@Payload WebSocketMessageDto.CreateRoomRequest request,
                          java.security.Principal principal) {
        try {
            // Principal에서 사용자 ID 추출
            if (principal == null) {
                throw new CustomException("WebSocket 인증 실패: Principal 없음", ErrorCode.UNAUTHORIZED);
            }
            UUID creatorId = UUID.fromString(principal.getName());
            
            // 사용자 정보 조회
            User creator = userRepository.findById(creatorId)
                    .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));
            
            // 참여자 ID 배열에 생성자도 포함
            UUID[] allParticipantIds = new UUID[request.getParticipantIds().length + 1];
            allParticipantIds[0] = creatorId;
            System.arraycopy(request.getParticipantIds(), 0, allParticipantIds, 1, request.getParticipantIds().length);
            
            // 참여자들 조회
            List<User> participants = new ArrayList<>();
            for (UUID participantId : allParticipantIds) {
                User participant = userRepository.findById(participantId)
                        .orElseThrow(() -> new CustomException("참여자 ID " + participantId + "를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));
                participants.add(participant);
            }
            
            // 채팅방 생성
            ChatRoom chatRoom = new ChatRoom();
            chatRoom.setName(request.getRoomName());
            chatRoom.setCreator(creator);
            chatRoom.setCreatedAt(LocalDateTime.now());
            // participants를 Set으로 변환하여 설정
            Set<User> participantSet = new HashSet<>(participants);
            chatRoom.setParticipants(participantSet);
            
            ChatRoom savedRoom = chatRoomRepository.save(chatRoom);
            
            // 생성 성공 응답
            WsEnvelope<Map<String, Object>> response = new WsEnvelope<>(
                    "room.created",
                    WsEnvelope.newMessageId(),
                    System.currentTimeMillis(),
                    Map.of(
                            "roomId", savedRoom.getId().toString(),
                            "roomName", savedRoom.getName(),
                            "participantCount", participants.size()
                    )
            );
            
            // 생성자에게 응답
            messagingTemplate.convertAndSendToUser(creatorId.toString(), "/queue/rooms", response);
            
            // 모든 참여자에게 채팅방 생성 알림
            for (User participant : participants) {
                if (!participant.getId().equals(creatorId)) {
                    WsEnvelope<Map<String, Object>> notification = new WsEnvelope<>(
                            "room.invited",
                            WsEnvelope.newMessageId(),
                            System.currentTimeMillis(),
                            Map.of(
                                    "roomId", savedRoom.getId().toString(),
                                    "roomName", savedRoom.getName(),
                                    "invitedBy", creator.getNickname()
                            )
                    );
                    messagingTemplate.convertAndSendToUser(participant.getId().toString(), "/queue/rooms", notification);
                }
            }
            
        } catch (Exception e) {
            // 에러 응답 - Principal 기반으로 전송
            if (principal != null) {
                WsEnvelope<WsEnvelope.ErrorPayload> response = new WsEnvelope<>(
                        "error",
                        WsEnvelope.newMessageId(),
                        System.currentTimeMillis(),
                        new WsEnvelope.ErrorPayload("CREATE_ROOM_ERROR", e.getMessage())
                );
                messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/errors", response);
            }
        }
    }

    @MessageMapping("/join-request")
    public void handleJoinRequest(@Payload WebSocketMessageDto.JoinRequest request,
                                 java.security.Principal principal) {
        try {
            String requesterId = request.getRequesterId();
            String roomId = request.getRoomId();
            
            log.info("가입 요청 수신: 사용자 {}가 채팅방 {}에 가입 요청".formatted(requesterId, roomId));
            
            // 채팅방 존재 여부 확인
            Optional<ChatRoom> chatRoomOpt = chatRoomRepository.findById(UUID.fromString(roomId));
            if (chatRoomOpt.isEmpty()) {
                log.warning("채팅방을 찾을 수 없음: " + roomId);
                return;
            }
            
            ChatRoom chatRoom = chatRoomOpt.get();
            
            // 요청자가 이미 참여자인지 확인
            if (chatRoom.getParticipants().stream()
                    .anyMatch(p -> p.getId().toString().equals(requesterId))) {
                log.info("사용자 {}는 이미 채팅방 {}의 참여자입니다".formatted(requesterId, roomId));
                return;
            }
            
            // 채팅방 소유자에게 가입 요청 전송
            User roomOwner = chatRoom.getCreator();
            
            if (roomOwner != null) {
                String requestId = UUID.randomUUID().toString();
                
                WsEnvelope<Map<String, Object>> joinRequest = new WsEnvelope<>(
                        "join.request",
                        WsEnvelope.newMessageId(),
                        System.currentTimeMillis(),
                        Map.of(
                                "requestId", requestId,
                                "requesterId", requesterId,
                                "roomId", roomId,
                                "roomName", chatRoom.getName()
                        )
                );
                
                messagingTemplate.convertAndSendToUser(roomOwner.getId().toString(), "/queue/join-requests", joinRequest);
                log.info("가입 요청을 채팅방 소유자 {}에게 전송했습니다".formatted(roomOwner.getId()));
            }
            
        } catch (Exception e) {
            log.severe("가입 요청 처리 중 오류 발생: " + e.getMessage());
        }
    }

    @MessageMapping("/join-response")
    public void handleJoinResponse(@Payload WebSocketMessageDto.JoinResponse response,
                                  SimpMessageHeaderAccessor headerAccessor) {
        try {
            String requestId = response.getRequestId();
            String requesterId = response.getRequesterId();
            String roomId = response.getRoomId();
            boolean accepted = response.isAccepted();
            
            log.info("가입 응답 수신: 요청 {}에 대한 응답 = {}".formatted(requestId, accepted ? "수락" : "거절"));
            
            if (accepted) {
                // 채팅방에 사용자 추가
                Optional<ChatRoom> chatRoomOpt = chatRoomRepository.findById(UUID.fromString(roomId));
                Optional<User> userOpt = userRepository.findById(UUID.fromString(requesterId));
                
                if (chatRoomOpt.isPresent() && userOpt.isPresent()) {
                    ChatRoom chatRoom = chatRoomOpt.get();
                    User user = userOpt.get();
                    
                    // 새로운 참여자 Set을 생성하여 설정
                    Set<User> newParticipants = new HashSet<>(chatRoom.getParticipants());
                    newParticipants.add(user);
                    chatRoom.setParticipants(newParticipants);
                    chatRoomRepository.save(chatRoom);
                    
                    log.info("사용자 {}를 채팅방 {}에 추가했습니다".formatted(requesterId, roomId));
                    
                    // 요청자에게 수락 알림 전송
                    WsEnvelope<Map<String, Object>> acceptNotification = new WsEnvelope<>(
                            "join.accepted",
                            WsEnvelope.newMessageId(),
                            System.currentTimeMillis(),
                            Map.of(
                                    "roomId", roomId,
                                    "roomName", chatRoom.getName()
                            )
                    );
                    
                    messagingTemplate.convertAndSendToUser(requesterId, "/queue/rooms", acceptNotification);
                }
            } else {
                // 요청자에게 거절 알림 전송
                WsEnvelope<Map<String, Object>> rejectNotification = new WsEnvelope<>(
                        "join.rejected",
                        WsEnvelope.newMessageId(),
                        System.currentTimeMillis(),
                        Map.of(
                                "roomId", roomId
                        )
                );
                
                messagingTemplate.convertAndSendToUser(requesterId, "/queue/rooms", rejectNotification);
            }
            
        } catch (Exception e) {
            log.severe("가입 응답 처리 중 오류 발생: " + e.getMessage());
        }
    }

    @MessageMapping("/subscribe")
    public void subscribe(@Payload WebSocketMessageDto.SubscribeRequest request,
                         java.security.Principal principal) {
        try {
            // Principal에서 사용자 ID 추출
            if (principal == null) {
                throw new CustomException("WebSocket 인증 실패: Principal 없음", ErrorCode.UNAUTHORIZED);
            }
            UUID userId = UUID.fromString(principal.getName());
            
            // 채팅방 존재 여부 및 사용자 참여 여부 확인
            ChatRoom chatRoom = chatRoomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new CustomException("채팅방을 찾을 수 없습니다.", ErrorCode.CHAT_ROOM_NOT_FOUND));
            
            // 사용자가 해당 채팅방에 참여하고 있는지 확인
            if (!chatRoom.getParticipants().stream()
                    .anyMatch(participant -> participant.getId().equals(userId))) {
                throw new CustomException("사용자가 해당 채팅방에 참여하지 않습니다.", ErrorCode.USER_NOT_IN_CHAT_ROOM);
            }
            
            // 채팅방 구독 성공 응답 (표준 스키마 적용)
            WsEnvelope<String> response = new WsEnvelope<>(
                    "subscribe.success",
                    WsEnvelope.newMessageId(),
                    System.currentTimeMillis(),
                    "채팅방 " + chatRoom.getName() + "에 성공적으로 구독했습니다."
            );
            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/subscribe", response);
            
        } catch (Exception e) {
            // 에러 응답 - Principal 기반으로 전송
            if (principal != null) {
                WsEnvelope<WsEnvelope.ErrorPayload> response = new WsEnvelope<>(
                        "error",
                        WsEnvelope.newMessageId(),
                        System.currentTimeMillis(),
                        new WsEnvelope.ErrorPayload("SUBSCRIBE_ERROR", e.getMessage())
                );
                messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/errors", response);
            }
        }
    }

    /**
     * 채팅방 정보 조회 (클라이언트에서 채팅방 존재 여부 확인용)
     */
    @Transactional
    @MessageMapping("/room-info")
    public void getRoomInfo(@Payload WebSocketMessageDto.RoomInfoRequest request,
                           java.security.Principal principal,
                           SimpMessageHeaderAccessor headerAccessor) {
        try {
            log.info("=== 채팅방 정보 조회 시작 ===");
            log.info("요청 데이터: " + request.toString());
            log.info("Principal 객체: " + (principal != null ? principal.getName() : "NULL"));
            
            // Principal이 null인 경우 SessionAttributes에서 복원 시도
            if (principal == null) {
                log.warning("Principal이 null - SessionAttributes에서 복원 시도");
                
                try {
                    var sessionAttributes = headerAccessor.getSessionAttributes();
                    if (sessionAttributes != null && sessionAttributes.containsKey("user")) {
                        var restoredPrincipal = (java.security.Principal) sessionAttributes.get("user");
                        principal = restoredPrincipal;
                        log.info("SessionAttributes에서 Principal 복원 성공: " + principal.getName());
                    } else {
                        log.severe("SessionAttributes에서 Principal 복원 실패 - user 키 없음");
                        log.severe("SessionAttributes 내용: " + sessionAttributes);
                    }
                } catch (Exception e) {
                    log.severe("Principal 복원 중 오류: " + e.getMessage());
                }
            }
            
            if (principal == null) {
                log.severe("Principal이 설정되지 않음 - 인증 실패");
                WsEnvelope<WsEnvelope.ErrorPayload> errorResponse = new WsEnvelope<>(
                        "error",
                        WsEnvelope.newMessageId(),
                        System.currentTimeMillis(),
                        new WsEnvelope.ErrorPayload("AUTH_ERROR", "채팅방 정보 조회 실패: 인증 실패")
                );
                messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/room-info", errorResponse);
                return;
            }
            
            final String userId = principal.getName();
            final String roomId = request.getRoomId();
            
            log.info("사용자 ID: " + userId);
            log.info("요청된 채팅방 ID: " + roomId);
            
            // 채팅방 존재 여부 확인 (String을 UUID로 변환)
            var chatRoom = chatRoomRepository.findById(UUID.fromString(roomId)).orElse(null);
            
            if (chatRoom != null) {
                log.info("채팅방 발견: " + chatRoom.getName());
                
                // 사용자가 해당 채팅방의 참가자인지 확인
                boolean isParticipant = chatRoom.getParticipants().stream()
                        .anyMatch(participant -> participant.getId().equals(userId));
                
                if (isParticipant) {
                    log.info("사용자가 채팅방 참가자임");
                    
                    // 채팅방 정보 응답
                    WsEnvelope<WebSocketMessageDto.RoomInfoResponse> response = new WsEnvelope<>(
                            "room.info",
                            WsEnvelope.newMessageId(),
                            System.currentTimeMillis(),
                            new WebSocketMessageDto.RoomInfoResponse(
                                    chatRoom.getId().toString(),
                                    chatRoom.getName(),
                                    chatRoom.getCreator().getNickname(),
                                    chatRoom.getParticipants().size(),
                                    true // 참가자임
                            )
                    );
                    
                    messagingTemplate.convertAndSendToUser(userId, "/queue/room-info", response);
                    log.info("채팅방 정보 응답 전송 완료");
                    
                } else {
                    log.warning("사용자가 채팅방 참가자가 아님");
                    
                    WsEnvelope<WsEnvelope.ErrorPayload> errorResponse = new WsEnvelope<>(
                            "error",
                            WsEnvelope.newMessageId(),
                            System.currentTimeMillis(),
                            new WsEnvelope.ErrorPayload("ACCESS_DENIED", "해당 채팅방에 접근 권한이 없습니다")
                    );
                    messagingTemplate.convertAndSendToUser(userId, "/queue/room-info", errorResponse);
                }
                
            } else {
                log.warning("채팅방을 찾을 수 없음: " + roomId);
                
                WsEnvelope<WsEnvelope.ErrorPayload> errorResponse = new WsEnvelope<>(
                        "error",
                        WsEnvelope.newMessageId(),
                        System.currentTimeMillis(),
                        new WsEnvelope.ErrorPayload("ROOM_NOT_FOUND", "채팅방을 찾을 수 없습니다")
                );
                messagingTemplate.convertAndSendToUser(userId, "/queue/room-info", errorResponse);
            }
            
        } catch (Exception e) {
            log.severe("채팅방 정보 조회 중 오류: " + e.getMessage());
            e.printStackTrace();
            
            // 에러 응답 전송
            try {
                WsEnvelope<WsEnvelope.ErrorPayload> errorResponse = new WsEnvelope<>(
                        "error",
                        WsEnvelope.newMessageId(),
                        System.currentTimeMillis(),
                        new WsEnvelope.ErrorPayload("INTERNAL_ERROR", "서버 내부 오류가 발생했습니다")
                );
                
                if (principal != null) {
                    messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/room-info", errorResponse);
                }
            } catch (Exception ex) {
                log.severe("에러 응답 전송 실패: " + ex.getMessage());
            }
        }
    }


    @Transactional
    @MessageMapping("/send-message")
    public void sendMessage(@Payload WebSocketMessageDto.SendMessageRequest request,
                          java.security.Principal principal,
                          SimpMessageHeaderAccessor headerAccessor) {
        try {
            log.info("=== 메시지 전송 시작 ===");
            log.info("메시지 전송 요청 데이터: " + request.toString());
            log.info("Principal 객체: " + (principal != null ? principal.getName() : "NULL"));
            
            // Principal이 null인 경우 SessionAttributes에서 복원 시도
            if (principal == null) {
                log.warning("Principal이 null - SessionAttributes에서 복원 시도");
                
                try {
                    var sessionAttributes = headerAccessor.getSessionAttributes();
                    if (sessionAttributes != null && sessionAttributes.containsKey("user")) {
                        var restoredPrincipal = (java.security.Principal) sessionAttributes.get("user");
                        principal = restoredPrincipal;
                        log.info("SessionAttributes에서 Principal 복원 성공: " + principal.getName());
                    } else {
                        log.severe("SessionAttributes에서 Principal 복원 실패 - user 키 없음");
                        log.severe("SessionAttributes 내용: " + sessionAttributes);
                    }
                } catch (Exception e) {
                    log.severe("Principal 복원 중 오류: " + e.getMessage());
                }
            }
            
            // Principal에서 사용자 ID 추출 (핵심!)
            if (principal == null) {
                log.severe("Principal이 설정되지 않음 - JWT 인증 실패");
                log.severe("WebSocket 연결 상태 확인 필요");
                log.severe("JWT 토큰이 올바르게 전달되었는지 확인 필요");
                
                // 에러 응답 전송
                WsEnvelope<WsEnvelope.ErrorPayload> errorResponse = new WsEnvelope<>(
                        "error",
                        WsEnvelope.newMessageId(),
                        System.currentTimeMillis(),
                        new WsEnvelope.ErrorPayload("AUTH_ERROR", "WebSocket 인증 실패: Principal 없음")
                );
                
                // 에러 응답을 모든 클라이언트에게 전송 (브로드캐스트)
                messagingTemplate.convertAndSend("/topic/errors", errorResponse);
                return;
            }
            
            final String userId = principal.getName();
            log.info("Principal에서 사용자 ID 추출: " + userId);
            
            log.info("사용자 ID: " + userId);
            log.info("채팅방 ID: " + request.getRoomId());
            log.info("메시지 내용: " + request.getContent());
            
            // 사용자 정보 조회
            User sender = userRepository.findById(UUID.fromString(userId))
                    .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));
            log.info("사용자 정보 조회 성공: " + sender.getNickname());
            
            // 채팅방 정보 조회 (String roomId를 UUID로 변환)
            UUID roomId = UUID.fromString(request.getRoomId());
            ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                    .orElseThrow(() -> new CustomException("채팅방을 찾을 수 없습니다.", ErrorCode.CHAT_ROOM_NOT_FOUND));
            log.info("채팅방 정보 조회 성공: " + chatRoom.getName());
            
            // 참여자 목록 확인
            log.info("채팅방 참여자 수: " + chatRoom.getParticipants().size());
            log.info("채팅방 참여자 목록: " + chatRoom.getParticipants().stream()
                    .map(p -> p.getId() + "(" + p.getNickname() + ")")
                    .collect(Collectors.joining(", ")));
            
            // 사용자 참여 여부 확인 - userId를 final로 선언했으므로 Lambda에서 사용 가능
            boolean isParticipant = chatRoom.getParticipants().stream()
                    .anyMatch(participant -> participant.getId().equals(UUID.fromString(userId)));
            log.info("사용자 " + userId + "의 참여 여부: " + isParticipant);
            
            if (!isParticipant) {
                log.severe("사용자 " + userId + "가 채팅방 " + roomId + "에 참여하지 않음");
                throw new CustomException("사용자가 해당 채팅방에 참여하지 않습니다.", ErrorCode.USER_NOT_IN_CHAT_ROOM);
            }
            
            log.info("사용자 참여 확인 성공");
                
            // 멱등성 체크: clientMessageId가 있으면 중복 저장 방지
            if (request.getClientMessageId() != null && !request.getClientMessageId().trim().isEmpty()) {
                var existing = chatMessageRepository.findByChatRoom_IdAndClientMessageId(chatRoom.getId(), request.getClientMessageId());
                if (existing.isPresent()) {
                    WsEnvelope<WsEnvelope.ReceiptPayload> dupReceipt = new WsEnvelope<>(
                            "chat.receipt",
                            WsEnvelope.newMessageId(),
                            System.currentTimeMillis(),
                            new WsEnvelope.ReceiptPayload(request.getClientMessageId(), "duplicate", existing.get().getId().toString())
                    );
                    messagingTemplate.convertAndSendToUser(userId, "/queue/receipts", dupReceipt);
                    return;
                }
            }

            // 순서 번호 발행
            long sequence = chatRoom.issueSequence();

            // 메시지 생성 및 저장
            ChatMessage message = new ChatMessage(request.getContent(), sender, chatRoom);
            message.setSequence(sequence);
            message.setClientMessageId(request.getClientMessageId());
            ChatMessage savedMessage = chatMessageRepository.save(message);
            
            // 새 메시지 알림 생성
            WebSocketMessageDto.UserInfoDto senderInfo = new WebSocketMessageDto.UserInfoDto(
                    sender.getId(),
                    sender.getNickname()
            );
            
            WebSocketMessageDto.NewMessageNotification notification = new WebSocketMessageDto.NewMessageNotification(
                    savedMessage.getId(),
                    chatRoom.getId(),
                    savedMessage.getContent(),
                    senderInfo,
                    savedMessage.getSentAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                    savedMessage.getSequence()
            );

            WsEnvelope<WebSocketMessageDto.NewMessageNotification> response = new WsEnvelope<>(
                    "chat.message",
                    WsEnvelope.newMessageId(),
                    System.currentTimeMillis(),
                    notification
            );
            
            // ✅ 채팅방 토픽으로 모든 참여자에게 메시지 브로드캐스트
            log.info("=== 메시지 전송 시작 ===");
            log.info("전송할 메시지: " + response.toString());
            log.info("전송 대상 참여자 수: " + chatRoom.getParticipants().size());
            
            // 채팅방 토픽으로 메시지 브로드캐스트 (클라이언트 구독 경로와 일치)
            String topicDestination = "/topic/chat/" + chatRoom.getId().toString();
            log.info("브로드캐스트 목적지: " + topicDestination);
            
            try {
                messagingTemplate.convertAndSend(topicDestination, response);
                log.info("채팅방 " + chatRoom.getName() + "에 메시지 브로드캐스트 성공");
            } catch (Exception e) {
                log.severe("채팅방 브로드캐스트 실패: " + e.getMessage());
                e.printStackTrace();
            }
            
            log.info("=== 메시지 전송 완료 ===");

            // 송신자에게 수신증명(ack) 전송
            WsEnvelope<WsEnvelope.ReceiptPayload> receipt = new WsEnvelope<>(
                    "chat.receipt",
                    WsEnvelope.newMessageId(),
                    System.currentTimeMillis(),
                    new WsEnvelope.ReceiptPayload(request.getClientMessageId(), "ok", savedMessage.getId().toString())
            );
            messagingTemplate.convertAndSendToUser(userId, "/queue/receipts", receipt);
            
        } catch (Exception e) {
            log.severe("메시지 전송 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            
            // 에러 응답 - Principal을 직접 사용
            String userId = principal.getName();
                
            WsEnvelope<WsEnvelope.ErrorPayload> response = new WsEnvelope<>(
                    "error",
                    WsEnvelope.newMessageId(),
                    System.currentTimeMillis(),
                    new WsEnvelope.ErrorPayload("SEND_MESSAGE_ERROR", e.getMessage())
            );
            messagingTemplate.convertAndSendToUser(userId, "/queue/errors", response);
        }
    }


} 