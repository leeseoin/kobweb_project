package com.kob_backend_seoin.kob_backend.dto.Chat;

import java.util.UUID;

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
        private String roomName;
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
        private String roomId;
        private String requesterId;

        public JoinRequest() {}

        public JoinRequest(String roomId, String requesterId) {
            this.roomId = roomId;
            this.requesterId = requesterId;
        }

        public String getRoomId() { return roomId; }
        public String getRequesterId() { return requesterId; }
        public void setRoomId(String roomId) { this.roomId = roomId; }
        public void setRequesterId(String requesterId) { this.requesterId = requesterId; }
    }

    public static class JoinResponse {
        private String requestId;
        private String requesterId;
        private String roomId;
        private boolean accepted;

        public JoinResponse() {}

        public JoinResponse(String requestId, String requesterId, String roomId, boolean accepted) {
            this.requestId = requestId;
            this.requesterId = requesterId;
            this.roomId = roomId;
            this.accepted = accepted;
        }

        public String getRequestId() { return requestId; }
        public String getRequesterId() { return requesterId; }
        public String getRoomId() { return roomId; }
        public boolean isAccepted() { return accepted; }
        public void setRequestId(String requestId) { this.requestId = requestId; }
        public void setRequesterId(String requesterId) { this.requesterId = requesterId; }
        public void setRoomId(String roomId) { this.roomId = roomId; }
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
        private String roomId;  // UUID를 String으로 변경
        private String content;
        private String clientMessageId; // 멱등성 식별자 (at-least-once 대비)

        public SendMessageRequest() {}

        public SendMessageRequest(String roomId, String content) {
            this.roomId = roomId;
            this.content = content;
        }

        public String getRoomId() { return roomId; }
        public String getContent() { return content; }
        public String getClientMessageId() { return clientMessageId; }
        public void setRoomId(String roomId) { this.roomId = roomId; }
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
        private String roomId;

        public RoomInfoRequest() {}

        public RoomInfoRequest(String roomId) {
            this.roomId = roomId;
        }

        public String getRoomId() { return roomId; }
        public void setRoomId(String roomId) { this.roomId = roomId; }
    }

    // 내부 클래스: 채팅방 정보 응답
    public static class RoomInfoResponse {
        private String roomId;
        private String roomName;
        private String creatorNickname;
        private int participantCount;
        private boolean isParticipant;

        public RoomInfoResponse() {}

        public RoomInfoResponse(String roomId, String roomName, String creatorNickname, int participantCount, boolean isParticipant) {
            this.roomId = roomId;
            this.roomName = roomName;
            this.creatorNickname = creatorNickname;
            this.participantCount = participantCount;
            this.isParticipant = isParticipant;
        }

        public String getRoomId() { return roomId; }
        public String getRoomName() { return roomName; }
        public String getCreatorNickname() { return creatorNickname; }
        public int getParticipantCount() { return participantCount; }
        public boolean isParticipant() { return isParticipant; }
        public void setRoomId(String roomId) { this.roomId = roomId; }
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