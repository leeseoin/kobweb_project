package com.kob_backend_seoin.kob_backend.dto.Chat;

import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class WebSocketMessageDto {
    private String type;
    private Object payload;

    public WebSocketMessageDto() {}

    public WebSocketMessageDto(String type, Object payload) {
        this.type = type;
        this.payload = payload;
    }

    public String getType() { return type; }
    public Object getPayload() { return payload; }
    public void setType(String type) { this.type = type; }
    public void setPayload(Object payload) { this.payload = payload; }

    // 내부 클래스: 채팅방 생성 요청
    public static class CreateRoomRequest {
        @NotBlank(message = "채팅방 이름은 필수입니다")
        @Size(max = 100, message = "채팅방 이름은 100자를 초과할 수 없습니다")
        private String roomName;

        @NotNull(message = "참여자 목록은 필수입니다")
        @Size(min = 1, max = 50, message = "참여자는 1명 이상 50명 이하여야 합니다")
        private UUID[] participantIds;

        public CreateRoomRequest() {}

        public CreateRoomRequest(String roomName, UUID[] participantIds) {
            this.roomName = roomName;
            this.participantIds = participantIds;
        }

        public String getRoomName() { return roomName; }
        public UUID[] getParticipantIds() { return participantIds; }
        public void setRoomName(String roomName) { this.roomName = roomName; }
        public void setParticipantIds(UUID[] participantIds) { this.participantIds = participantIds; }
    }

    public static class JoinRequest {
        @NotNull(message = "채팅방 ID는 필수입니다")
        private UUID roomId;

        @NotNull(message = "요청자 ID는 필수입니다")
        private UUID requesterId;

        public JoinRequest() {}

        public JoinRequest(UUID roomId, UUID requesterId) {
            this.roomId = roomId;
            this.requesterId = requesterId;
        }

        public UUID getRoomId() { return roomId; }
        public UUID getRequesterId() { return requesterId; }
        public void setRoomId(UUID roomId) { this.roomId = roomId; }
        public void setRequesterId(UUID requesterId) { this.requesterId = requesterId; }
    }

    public static class JoinResponse {
        private String requestId;
        private UUID requesterId;
        private UUID roomId;
        private boolean accepted;

        public JoinResponse() {}

        public JoinResponse(String requestId, UUID requesterId, UUID roomId, boolean accepted) {
            this.requestId = requestId;
            this.requesterId = requesterId;
            this.roomId = roomId;
            this.accepted = accepted;
        }

        public String getRequestId() { return requestId; }
        public UUID getRequesterId() { return requesterId; }
        public UUID getRoomId() { return roomId; }
        public boolean isAccepted() { return accepted; }
        public void setRequestId(String requestId) { this.requestId = requestId; }
        public void setRequesterId(UUID requesterId) { this.requesterId = requesterId; }
        public void setRoomId(UUID roomId) { this.roomId = roomId; }
        public void setAccepted(boolean accepted) { this.accepted = accepted; }
    }

    // 내부 클래스: 구독 요청
    public static class SubscribeRequest {
        private UUID roomId;

        public SubscribeRequest() {}

        public SubscribeRequest(UUID roomId) {
            this.roomId = roomId;
        }

        public UUID getRoomId() {
            return roomId;
        }

        public void setRoomId(UUID roomId) {
            this.roomId = roomId;
        }
    }

    // 내부 클래스: 메시지 전송 요청
    public static class SendMessageRequest {
        @NotNull(message = "채팅방 ID는 필수입니다")
        private UUID roomId;

        @NotBlank(message = "메시지 내용은 필수입니다")
        @Size(max = 1000, message = "메시지는 1000자를 초과할 수 없습니다")
        private String content;

        @Size(max = 100, message = "클라이언트 메시지 ID는 100자를 초과할 수 없습니다")
        private String clientMessageId; // 멱등성 식별자 (at-least-once 대비)

        public SendMessageRequest() {}

        public SendMessageRequest(UUID roomId, String content) {
            this.roomId = roomId;
            this.content = content;
        }

        public UUID getRoomId() { return roomId; }
        public String getContent() { return content; }
        public String getClientMessageId() { return clientMessageId; }
        public void setRoomId(UUID roomId) { this.roomId = roomId; }
        public void setContent(String content) { this.content = content; }
        public void setClientMessageId(String clientMessageId) { this.clientMessageId = clientMessageId; }
    }

    // 내부 클래스: 새 메시지 알림
    public static class NewMessageNotification {
        private UUID messageId;
        private UUID roomId;
        private String content;
        private UserInfoDto sender;
        private String sentAt;
        private long sequence; // 방 단위 순차 번호

        public NewMessageNotification() {}

        public NewMessageNotification(UUID messageId, UUID roomId, String content, UserInfoDto sender, String sentAt, long sequence) {
            this.messageId = messageId;
            this.roomId = roomId;
            this.content = content;
            this.sender = sender;
            this.sentAt = sentAt;
            this.sequence = sequence;
        }

        public UUID getMessageId() {
            return messageId;
        }

        public UUID getRoomId() {
            return roomId;
        }

        public String getContent() {
            return content;
        }

        public UserInfoDto getSender() {
            return sender;
        }

        public String getSentAt() {
            return sentAt;
        }

        public void setMessageId(UUID messageId) {
            this.messageId = messageId;
        }

        public void setRoomId(UUID roomId) {
            this.roomId = roomId;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public void setSender(UserInfoDto sender) {
            this.sender = sender;
        }

        public void setSentAt(String sentAt) { this.sentAt = sentAt; }
        public long getSequence() { return sequence; }
        public void setSequence(long sequence) { this.sequence = sequence; }
    }

    // 내부 클래스: 사용자 정보
    public static class UserInfoDto {
        private UUID id;
        private String nickname;

        public UserInfoDto() {}

        public UserInfoDto(UUID id, String nickname) {
            this.id = id;
            this.nickname = nickname;
        }

        public UUID getId() {
            return id;
        }

        public String getNickname() {
            return nickname;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public void setNickname(String nickname) {
            this.nickname = nickname;
        }
    }

    // 내부 클래스: 에러 응답
    public static class ErrorResponse {
        private String error;
        private String message;

        public ErrorResponse() {}

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }

        public String getError() {
            return error;
        }

        public String getMessage() {
            return message;
        }

        public void setError(String error) {
            this.error = error;
        }

        public void setMessage(String message) { this.message = message; }
    }

    // 내부 클래스: 채팅방 정보 조회 요청
    public static class RoomInfoRequest {
        private UUID roomId;

        public RoomInfoRequest() {}

        public RoomInfoRequest(UUID roomId) {
            this.roomId = roomId;
        }

        public UUID getRoomId() { return roomId; }
        public void setRoomId(UUID roomId) { this.roomId = roomId; }
    }

    // 내부 클래스: 채팅방 정보 응답
    public static class RoomInfoResponse {
        private UUID roomId;
        private String roomName;
        private String creatorNickname;
        private int participantCount;
        private boolean isParticipant;

        public RoomInfoResponse() {}

        public RoomInfoResponse(UUID roomId, String roomName, String creatorNickname, int participantCount, boolean isParticipant) {
            this.roomId = roomId;
            this.roomName = roomName;
            this.creatorNickname = creatorNickname;
            this.participantCount = participantCount;
            this.isParticipant = isParticipant;
        }

        public UUID getRoomId() { return roomId; }
        public String getRoomName() { return roomName; }
        public String getCreatorNickname() { return creatorNickname; }
        public int getParticipantCount() { return participantCount; }
        public boolean isParticipant() { return isParticipant; }
        public void setRoomId(UUID roomId) { this.roomId = roomId; }
        public void setRoomName(String roomName) { this.roomName = roomName; }
        public void setCreatorNickname(String creatorNickname) { this.creatorNickname = creatorNickname; }
        public void setParticipantCount(int participantCount) { this.participantCount = participantCount; }
        public void setIsParticipant(boolean isParticipant) { this.isParticipant = isParticipant; }
    }

    // 내부 클래스: 인증 요청
    public static class AuthRequest {
        private String token;
        private String userId;

        public AuthRequest() {}

        public AuthRequest(String token) {
            this.token = token;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }
    }

    // 내부 클래스: 채팅 메시지 응답
    public static class ChatMessageResponse {
        private UUID messageId;
        private UUID roomId;
        private String content;
        private UserInfoDto sender;
        private String sentAt;
        private long sequence;

        public ChatMessageResponse() {}

        public ChatMessageResponse(UUID messageId, UUID roomId, String content, UserInfoDto sender, String sentAt, long sequence) {
            this.messageId = messageId;
            this.roomId = roomId;
            this.content = content;
            this.sender = sender;
            this.sentAt = sentAt;
            this.sequence = sequence;
        }

        public UUID getMessageId() {
            return messageId;
        }

        public UUID getRoomId() {
            return roomId;
        }

        public String getContent() {
            return content;
        }

        public UserInfoDto getSender() {
            return sender;
        }

        public String getSentAt() {
            return sentAt;
        }

        public long getSequence() {
            return sequence;
        }

        public void setMessageId(UUID messageId) {
            this.messageId = messageId;
        }

        public void setRoomId(UUID roomId) {
            this.roomId = roomId;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public void setSender(UserInfoDto sender) {
            this.sender = sender;
        }

        public void setSentAt(String sentAt) {
            this.sentAt = sentAt;
        }

        public void setSequence(long sequence) {
            this.sequence = sequence;
        }

        public UUID getSenderId() {
            return sender != null ? sender.getId() : null;
        }
    }
} 