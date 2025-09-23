package com.kob_backend_seoin.kob_backend.controller;

import com.kob_backend_seoin.kob_backend.domain.ChatMessage;
import com.kob_backend_seoin.kob_backend.domain.ChatRoom;
import com.kob_backend_seoin.kob_backend.domain.User;
import com.kob_backend_seoin.kob_backend.dto.Chat.WebSocketMessageDto;
import com.kob_backend_seoin.kob_backend.dto.Chat.WsEnvelope;
import com.kob_backend_seoin.kob_backend.exception.CustomException;
import com.kob_backend_seoin.kob_backend.exception.ErrorCode;
import com.kob_backend_seoin.kob_backend.repository.ChatMessageRepository;
import com.kob_backend_seoin.kob_backend.repository.ChatRoomRepository;
import com.kob_backend_seoin.kob_backend.repository.UserRepository;
import com.kob_backend_seoin.kob_backend.service.WebSocketAuthService;
import com.kob_backend_seoin.kob_backend.service.ChatMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
import java.util.logging.Logger;

@Controller
public class WebSocketChatController {

    private static final Logger log = Logger.getLogger(WebSocketChatController.class.getName());
    

    
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final WebSocketAuthService webSocketAuthService;
    private final ChatMessageService chatMessageService;

    @Autowired
    public WebSocketChatController(SimpMessagingTemplate messagingTemplate,
                                 ChatMessageRepository chatMessageRepository,
                                 ChatRoomRepository chatRoomRepository,
                                 UserRepository userRepository,
                                 WebSocketAuthService webSocketAuthService,
                                 ChatMessageService chatMessageService) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.userRepository = userRepository;
        this.webSocketAuthService = webSocketAuthService;
        this.chatMessageService = chatMessageService;
    }

    @MessageMapping("/create-room")
    public void createRoom(@Payload WebSocketMessageDto.CreateRoomRequest request,
                          SimpMessageHeaderAccessor headerAccessor) {
        try {
            // SimpMessageHeaderAccessor에서 직접 Principal 가져오기 (ChannelInterceptor에서 설정됨)
            java.security.Principal principal = headerAccessor.getUser();

            // Principal이 null인 경우 SessionAttributes에서 직접 가져오기
            if (principal == null) {
                var sessionAttributes = headerAccessor.getSessionAttributes();
                if (sessionAttributes != null && sessionAttributes.containsKey("user")) {
                    var restoredPrincipal = (java.security.Principal) sessionAttributes.get("user");
                    principal = restoredPrincipal;
                    log.info("Controller에서 Principal 복원 성공: " + principal.getName());
                }
            }

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
            java.security.Principal principal = headerAccessor.getUser();
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
                                 SimpMessageHeaderAccessor headerAccessor) {
        try {
            UUID requesterId = request.getRequesterId();
            UUID roomId = request.getRoomId();

            log.info("가입 요청 수신: 사용자 {}가 채팅방 {}에 가입 요청".formatted(requesterId, roomId));

            // 채팅방 존재 여부 확인
            Optional<ChatRoom> chatRoomOpt = chatRoomRepository.findById(roomId);
            if (chatRoomOpt.isEmpty()) {
                log.warning("채팅방을 찾을 수 없음: " + roomId);
                return;
            }

            ChatRoom chatRoom = chatRoomOpt.get();

            // 요청자가 이미 참여자인지 확인
            if (chatRoom.getParticipants().stream()
                    .anyMatch(p -> p.getId().equals(requesterId))) {
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
                                "requesterId", requesterId.toString(),
                                "roomId", roomId.toString(),
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
            UUID requesterId = response.getRequesterId();
            UUID roomId = response.getRoomId();
            boolean accepted = response.isAccepted();

            log.info("가입 응답 수신: 요청 {}에 대한 응답 = {}".formatted(requestId, accepted ? "수락" : "거절"));

            if (accepted) {
                // 채팅방에 사용자 추가
                Optional<ChatRoom> chatRoomOpt = chatRoomRepository.findById(roomId);
                Optional<User> userOpt = userRepository.findById(requesterId);
                
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
                                    "roomId", roomId.toString(),
                                    "roomName", chatRoom.getName()
                            )
                    );

                    messagingTemplate.convertAndSendToUser(requesterId.toString(), "/queue/rooms", acceptNotification);
                }
            } else {
                // 요청자에게 거절 알림 전송
                WsEnvelope<Map<String, Object>> rejectNotification = new WsEnvelope<>(
                        "join.rejected",
                        WsEnvelope.newMessageId(),
                        System.currentTimeMillis(),
                        Map.of(
                                "roomId", roomId.toString()
                        )
                );

                messagingTemplate.convertAndSendToUser(requesterId.toString(), "/queue/rooms", rejectNotification);
            }
            
        } catch (Exception e) {
            log.severe("가입 응답 처리 중 오류 발생: " + e.getMessage());
        }
    }

    @MessageMapping("/subscribe")
    public void subscribe(@Payload WebSocketMessageDto.SubscribeRequest request,
                         SimpMessageHeaderAccessor headerAccessor) {
        try {
            // SimpMessageHeaderAccessor에서 직접 Principal 가져오기 (ChannelInterceptor에서 설정됨)
            java.security.Principal principal = headerAccessor.getUser();

            // Principal이 null인 경우 SessionAttributes에서 직접 가져오기
            if (principal == null) {
                var sessionAttributes = headerAccessor.getSessionAttributes();
                if (sessionAttributes != null && sessionAttributes.containsKey("user")) {
                    var restoredPrincipal = (java.security.Principal) sessionAttributes.get("user");
                    principal = restoredPrincipal;
                    log.info("Controller에서 Principal 복원 성공: " + principal.getName());
                }
            }

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
            java.security.Principal principal = headerAccessor.getUser();
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
    // @MessageMapping("/room-info")
    public void getRoomInfo(@Payload WebSocketMessageDto.RoomInfoRequest request,
                           SimpMessageHeaderAccessor headerAccessor) {
        try {
            log.info("채팅방 정보 조회 시작 - roomId: " + request.getRoomId());

            // SimpMessageHeaderAccessor에서 직접 Principal 가져오기 (ChannelInterceptor에서 설정됨)
            java.security.Principal principal = headerAccessor.getUser();

            // Principal이 null인 경우 SessionAttributes에서 직접 가져오기
            if (principal == null) {
                var sessionAttributes = headerAccessor.getSessionAttributes();
                if (sessionAttributes != null && sessionAttributes.containsKey("user")) {
                    var restoredPrincipal = (java.security.Principal) sessionAttributes.get("user");
                    principal = restoredPrincipal;
                    log.info("Controller에서 Principal 복원 성공: " + principal.getName());
                } else {
                    log.severe("Principal이 설정되지 않음 - 인증 실패");
                    WsEnvelope<WsEnvelope.ErrorPayload> errorResponse = new WsEnvelope<>(
                            "error",
                            WsEnvelope.newMessageId(),
                            System.currentTimeMillis(),
                            new WsEnvelope.ErrorPayload("AUTH_ERROR", "채팅방 정보 조회 실패: 인증 실패")
                    );
                    messagingTemplate.convertAndSend("/topic/errors", errorResponse);
                    return;
                }
            }
            
            final String userId = principal.getName();
            final UUID roomId = request.getRoomId();

            // 채팅방 존재 여부 및 참가자 확인 (LazyInitializationException 방지)
            boolean isParticipant = chatRoomRepository.isUserParticipant(roomId, UUID.fromString(userId));
            var chatRoom = chatRoomRepository.findByIdWithParticipants(roomId).orElse(null);

            if (chatRoom != null && isParticipant) {
                    
                    // 채팅방 정보 응답
                    WsEnvelope<WebSocketMessageDto.RoomInfoResponse> response = new WsEnvelope<>(
                            "room.info",
                            WsEnvelope.newMessageId(),
                            System.currentTimeMillis(),
                            new WebSocketMessageDto.RoomInfoResponse(
                                    chatRoom.getId(),
                                    chatRoom.getName(),
                                    chatRoom.getCreator().getNickname(),
                                    chatRoom.getParticipants().size(),
                                    true // 참가자임
                            )
                    );
                    
                    messagingTemplate.convertAndSendToUser(userId, "/queue/room-info", response);

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
                
                java.security.Principal principal = headerAccessor.getUser();
                if (principal != null) {
                    messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/room-info", errorResponse);
                }
            } catch (Exception ex) {
                log.severe("에러 응답 전송 실패: " + ex.getMessage());
            }
        }
    }


    @MessageMapping("/send-message")
    public void sendMessage(@Payload WebSocketMessageDto.SendMessageRequest request,
                          SimpMessageHeaderAccessor headerAccessor) {
        try {
            log.info("=== 메시지 전송 시작 ===");
            log.info("roomId: " + request.getRoomId());
            log.info("content length: " + request.getContent().length());
            log.info("clientMessageId: " + request.getClientMessageId());

            // SimpMessageHeaderAccessor에서 직접 Principal 가져오기 (ChannelInterceptor에서 설정됨)
            java.security.Principal principal = headerAccessor.getUser();

            // Principal이 null인 경우 SessionAttributes에서 직접 가져오기
            if (principal == null) {
                var sessionAttributes = headerAccessor.getSessionAttributes();
                if (sessionAttributes != null && sessionAttributes.containsKey("user")) {
                    var restoredPrincipal = (java.security.Principal) sessionAttributes.get("user");
                    principal = restoredPrincipal;
                    log.info("Controller에서 Principal 복원 성공: " + principal.getName());
                }
            }

            // 공통 인증 검증 로직 사용
            final UUID userId = webSocketAuthService.validateAndExtractUserId(principal, headerAccessor);
            
            // 사용자 정보 조회
            User sender = userRepository.findById(userId)
                    .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));
            
            // 채팅방 정보 조회 및 사용자 참여 여부 확인 (LazyInitializationException 방지)
            UUID roomId = request.getRoomId();
            boolean isParticipant = chatRoomRepository.isUserParticipant(roomId, userId);
            ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                    .orElseThrow(() -> new CustomException("채팅방을 찾을 수 없습니다.", ErrorCode.CHAT_ROOM_NOT_FOUND));
            
            if (!isParticipant) {
                throw new CustomException("사용자가 해당 채팅방에 참여하지 않습니다.", ErrorCode.USER_NOT_IN_CHAT_ROOM);
            }
                
            // 멱등성 체크: clientMessageId가 있으면 중복 저장 방지
            if (request.getClientMessageId() != null && !request.getClientMessageId().trim().isEmpty()) {
                var existing = chatMessageRepository.findByChatRoom_IdAndClientMessageId(chatRoom.getId(), request.getClientMessageId());
                if (existing.isPresent()) {
                    log.info("중복 메시지 감지 - clientMessageId: " + request.getClientMessageId());

                    // 기존 메시지를 다시 브로드캐스트 (네트워크 문제로 누락된 경우 대비)
                    ChatMessage existingMessage = existing.get();
                    WebSocketMessageDto.UserInfoDto senderInfo = new WebSocketMessageDto.UserInfoDto(
                            existingMessage.getSender().getId(),
                            existingMessage.getSender().getNickname()
                    );

                    WebSocketMessageDto.NewMessageNotification notification = new WebSocketMessageDto.NewMessageNotification(
                            existingMessage.getId(),
                            chatRoom.getId(),
                            existingMessage.getContent(),
                            senderInfo,
                            existingMessage.getSentAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                            existingMessage.getSequence()
                    );

                    WsEnvelope<WebSocketMessageDto.NewMessageNotification> response = new WsEnvelope<>(
                            "chat.message",
                            WsEnvelope.newMessageId(),
                            System.currentTimeMillis(),
                            notification
                    );

                    // 채팅방 토픽으로 메시지 재브로드캐스트
                    String topicDestination = "/topic/chat/" + chatRoom.getId().toString();
                    messagingTemplate.convertAndSend(topicDestination, response);

                    WsEnvelope<WsEnvelope.ReceiptPayload> dupReceipt = new WsEnvelope<>(
                            "chat.receipt",
                            WsEnvelope.newMessageId(),
                            System.currentTimeMillis(),
                            new WsEnvelope.ReceiptPayload(request.getClientMessageId(), "duplicate", existing.get().getId().toString())
                    );
                    messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/receipts", dupReceipt);
                    return;
                }
            }

            // 순서 번호 발행
            long sequence = chatRoom.issueSequence();

            // ChatMessageService를 통한 트랜잭션 처리된 메시지 저장
            ChatMessage savedMessage = chatMessageService.saveMessage(
                request.getContent(),
                sender,
                chatRoom,
                sequence,
                request.getClientMessageId()
            );
            
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
            
            
            // 채팅방 토픽으로 메시지 브로드캐스트
            String topicDestination = "/topic/chat/" + chatRoom.getId().toString();

            log.info("=== 메시지 브로드캐스트 ===");
            log.info("Destination: " + topicDestination);
            log.info("Message ID: " + savedMessage.getId());
            log.info("Sequence: " + savedMessage.getSequence());

            messagingTemplate.convertAndSend(topicDestination, response);

            log.info("메시지 브로드캐스트 완료");

            // 송신자에게 수신증명(ack) 전송
            WsEnvelope<WsEnvelope.ReceiptPayload> receipt = new WsEnvelope<>(
                    "chat.receipt",
                    WsEnvelope.newMessageId(),
                    System.currentTimeMillis(),
                    new WsEnvelope.ReceiptPayload(request.getClientMessageId(), "ok", savedMessage.getId().toString())
            );
            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/receipts", receipt);
            
        } catch (Exception e) {
            log.severe("메시지 전송 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            
            // 에러 응답 - Principal 안전 처리
            WsEnvelope<WsEnvelope.ErrorPayload> response = new WsEnvelope<>(
                    "error",
                    WsEnvelope.newMessageId(),
                    System.currentTimeMillis(),
                    new WsEnvelope.ErrorPayload("SEND_MESSAGE_ERROR", e.getMessage())
            );

            java.security.Principal principal = headerAccessor.getUser();
            if (principal != null) {
                try {
                    UUID userId = webSocketAuthService.extractUserId(principal);
                    messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/errors", response);
                } catch (Exception ex) {
                    messagingTemplate.convertAndSend("/topic/errors", response);
                }
            } else {
                messagingTemplate.convertAndSend("/topic/errors", response);
            }
        }
    }


} 