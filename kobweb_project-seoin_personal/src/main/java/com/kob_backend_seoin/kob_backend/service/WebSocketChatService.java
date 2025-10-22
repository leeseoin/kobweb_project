package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.domain.ChatMessage;
import com.kob_backend_seoin.kob_backend.domain.ChatRoom;
import com.kob_backend_seoin.kob_backend.domain.User;
import com.kob_backend_seoin.kob_backend.dto.Chat.WebSocketMessageDto;
import com.kob_backend_seoin.kob_backend.dto.Chat.WsEnvelope;
import com.kob_backend_seoin.kob_backend.exception.ChatErrorCode;
import com.kob_backend_seoin.kob_backend.exception.ChatException;
import com.kob_backend_seoin.kob_backend.repository.ChatMessageRepository;
import com.kob_backend_seoin.kob_backend.repository.ChatRoomRepository;
import com.kob_backend_seoin.kob_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.logging.Logger;

@Service
@Transactional
public class WebSocketChatService {

    private static final Logger log = Logger.getLogger(WebSocketChatService.class.getName());

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @Autowired
    public WebSocketChatService(ChatRoomRepository chatRoomRepository,
                               ChatMessageRepository chatMessageRepository,
                               UserRepository userRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    /**
     * 채팅방 생성 비즈니스 로직
     */
    public Map<String, Object> createRoom(WebSocketMessageDto.CreateRoomRequest request, Principal principal) {
        if (principal == null) {
            throw new ChatException(ChatErrorCode.WEBSOCKET_AUTH_FAILED, "Principal 없음");
        }

        UUID creatorId = UUID.fromString(principal.getName());

        // 사용자 정보 조회
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ChatException(ChatErrorCode.USER_NOT_IN_ROOM, "사용자를 찾을 수 없습니다"));

        // 참여자 ID 배열에 생성자도 포함
        UUID[] allParticipantIds = new UUID[request.getParticipantIds().length + 1];
        allParticipantIds[0] = creatorId;
        System.arraycopy(request.getParticipantIds(), 0, allParticipantIds, 1, request.getParticipantIds().length);

        // 참여자들 조회
        List<User> participants = new ArrayList<>();
        for (UUID participantId : allParticipantIds) {
            User participant = userRepository.findById(participantId)
                    .orElseThrow(() -> new ChatException(ChatErrorCode.USER_NOT_IN_ROOM, "참여자 ID " + participantId + "를 찾을 수 없습니다"));
            participants.add(participant);
        }

        // 채팅방 생성
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setName(request.getRoomName());
        chatRoom.setCreator(creator);
        chatRoom.setCreatedAt(LocalDateTime.now());
        Set<User> participantSet = new HashSet<>(participants);
        chatRoom.setParticipants(participantSet);

        ChatRoom savedRoom = chatRoomRepository.save(chatRoom);

        return Map.of(
                "roomId", savedRoom.getId().toString(),
                "roomName", savedRoom.getName(),
                "participantCount", participants.size()
        );
    }

    /**
     * 채팅방 정보 조회 비즈니스 로직
     */
    public WebSocketMessageDto.RoomInfoResponse getRoomInfo(WebSocketMessageDto.RoomInfoRequest request, Principal principal) {
        if (principal == null) {
            throw new ChatException(ChatErrorCode.WEBSOCKET_AUTH_FAILED, "Principal 없음");
        }

        final String userId = principal.getName();
        final UUID roomId = request.getRoomId();

        // 채팅방 존재 여부 확인
        ChatRoom chatRoom = chatRoomRepository.findByIdWithParticipants(roomId)
                .orElseThrow(() -> new ChatException(ChatErrorCode.ROOM_NOT_FOUND, "채팅방을 찾을 수 없습니다"));

        // 사용자가 해당 채팅방의 참가자인지 확인
        boolean isParticipant = chatRoom.getParticipants().stream()
                .anyMatch(participant -> participant.getId().toString().equals(userId));

        if (!isParticipant) {
            throw new ChatException(ChatErrorCode.ROOM_ACCESS_DENIED, "해당 채팅방에 접근 권한이 없습니다");
        }

        return new WebSocketMessageDto.RoomInfoResponse(
                chatRoom.getId(),
                chatRoom.getName(),
                chatRoom.getCreator().getNickname(),
                chatRoom.getParticipants().size(),
                true
        );
    }

    /**
     * 메시지 전송 비즈니스 로직
     */
    public WebSocketMessageDto.NewMessageNotification sendMessage(
            WebSocketMessageDto.SendMessageRequest request, Principal principal) {

        if (principal == null) {
            throw new ChatException(ChatErrorCode.WEBSOCKET_AUTH_FAILED, "Principal 없음");
        }

        final String userId = principal.getName();
        log.info("메시지 전송 시작 - roomId: " + request.getRoomId() + ", content: " + request.getContent());

        // 사용자 정보 조회
        User sender = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new ChatException(ChatErrorCode.USER_NOT_IN_ROOM, "사용자를 찾을 수 없습니다"));

        // 채팅방 정보 조회
        UUID roomId = request.getRoomId();
        ChatRoom chatRoom = chatRoomRepository.findByIdWithParticipants(roomId)
                .orElseThrow(() -> new ChatException(ChatErrorCode.ROOM_NOT_FOUND, "채팅방을 찾을 수 없습니다"));

        // 사용자 참여 여부 확인
        boolean isParticipant = chatRoom.getParticipants().stream()
                .anyMatch(participant -> participant.getId().equals(UUID.fromString(userId)));

        if (!isParticipant) {
            throw new ChatException(ChatErrorCode.USER_NOT_IN_ROOM, "사용자가 해당 채팅방에 참여하지 않습니다");
        }

        // 멱등성 체크: clientMessageId가 있으면 중복 저장 방지
        if (request.getClientMessageId() != null && !request.getClientMessageId().trim().isEmpty()) {
            var existing = chatMessageRepository.findByChatRoom_IdAndClientMessageId(chatRoom.getId(), request.getClientMessageId());
            if (existing.isPresent()) {
                // 중복 메시지이므로 기존 메시지 반환
                ChatMessage existingMessage = existing.get();
                return createNewMessageNotification(existingMessage);
            }
        }

        // 순서 번호 발행
        long sequence = chatRoom.issueSequence();

        // 메시지 생성 및 저장
        ChatMessage message = new ChatMessage(request.getContent(), sender, chatRoom);
        message.setSequence(sequence);
        message.setClientMessageId(request.getClientMessageId());
        ChatMessage savedMessage = chatMessageRepository.save(message);

        return createNewMessageNotification(savedMessage);
    }

    /**
     * 가입 요청 처리 비즈니스 로직
     */
    public Map<String, Object> handleJoinRequest(WebSocketMessageDto.JoinRequest request) {
        UUID requesterId = request.getRequesterId();
        UUID roomId = request.getRoomId();

        log.info("가입 요청 수신: 사용자 " + requesterId + "가 채팅방 " + roomId + "에 가입 요청");

        // 채팅방 존재 여부 확인
        ChatRoom chatRoom = chatRoomRepository.findByIdWithParticipants(roomId)
                .orElseThrow(() -> new ChatException(ChatErrorCode.ROOM_NOT_FOUND, "채팅방을 찾을 수 없습니다"));

        // 요청자가 이미 참여자인지 확인
        if (chatRoom.getParticipants().stream()
                .anyMatch(p -> p.getId().equals(requesterId))) {
            throw new ChatException(ChatErrorCode.USER_ALREADY_IN_ROOM, "사용자가 이미 채팅방에 참여하고 있습니다");
        }

        String requestId = UUID.randomUUID().toString();

        return Map.of(
                "requestId", requestId,
                "requesterId", requesterId.toString(),
                "roomId", roomId.toString(),
                "roomName", chatRoom.getName(),
                "roomOwnerId", chatRoom.getCreator().getId().toString()
        );
    }

    /**
     * 가입 응답 처리 비즈니스 로직
     */
    public Map<String, Object> handleJoinResponse(WebSocketMessageDto.JoinResponse response) {
        UUID requesterId = response.getRequesterId();
        UUID roomId = response.getRoomId();
        boolean accepted = response.isAccepted();

        log.info("가입 응답 수신: 요청에 대한 응답 = " + (accepted ? "수락" : "거절"));

        if (accepted) {
            // 채팅방에 사용자 추가
            ChatRoom chatRoom = chatRoomRepository.findByIdWithParticipants(roomId)
                    .orElseThrow(() -> new ChatException(ChatErrorCode.ROOM_NOT_FOUND, "채팅방을 찾을 수 없습니다"));

            User user = userRepository.findById(requesterId)
                    .orElseThrow(() -> new ChatException(ChatErrorCode.USER_NOT_IN_ROOM, "사용자를 찾을 수 없습니다"));

            // 새로운 참여자 Set을 생성하여 설정
            Set<User> newParticipants = new HashSet<>(chatRoom.getParticipants());
            newParticipants.add(user);
            chatRoom.setParticipants(newParticipants);
            chatRoomRepository.save(chatRoom);

            log.info("사용자 " + requesterId + "를 채팅방 " + roomId + "에 추가했습니다");

            return Map.of(
                    "roomId", roomId.toString(),
                    "roomName", chatRoom.getName(),
                    "accepted", true
            );
        } else {
            return Map.of(
                    "roomId", roomId.toString(),
                    "accepted", false
            );
        }
    }

    private WebSocketMessageDto.NewMessageNotification createNewMessageNotification(ChatMessage message) {
        WebSocketMessageDto.UserInfoDto senderInfo = new WebSocketMessageDto.UserInfoDto(
                message.getSender().getId(),
                message.getSender().getNickname()
        );

        return new WebSocketMessageDto.NewMessageNotification(
                message.getId(),
                message.getChatRoom().getId(),
                message.getContent(),
                senderInfo,
                message.getSentAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                message.getSequence()
        );
    }
}