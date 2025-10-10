package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.dto.Chat.WsEnvelope;
import com.kob_backend_seoin.kob_backend.exception.ChatErrorCode;
import com.kob_backend_seoin.kob_backend.exception.ChatException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.logging.Logger;

@Service
public class WebSocketMessageService {

    private static final Logger log = Logger.getLogger(WebSocketMessageService.class.getName());

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public WebSocketMessageService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 사용자에게 에러 메시지를 전송합니다.
     */
    public void sendErrorToUser(String userId, ChatException exception) {
        try {
            WsEnvelope<WsEnvelope.ErrorPayload> errorResponse = new WsEnvelope<>(
                    "error",
                    WsEnvelope.newMessageId(),
                    System.currentTimeMillis(),
                    new WsEnvelope.ErrorPayload(exception.getErrorCodeString(), exception.getMessage())
            );

            messagingTemplate.convertAndSendToUser(userId, "/queue/errors", errorResponse);
            log.info("에러 메시지를 사용자 " + userId + "에게 전송했습니다: " + exception.getErrorCodeString());

        } catch (Exception e) {
            log.severe("에러 메시지 전송 실패: " + e.getMessage());
        }
    }

    /**
     * 사용자에게 에러 메시지를 전송합니다 (일반 Exception용).
     */
    public void sendErrorToUser(String userId, String errorCode, String message) {
        sendErrorToUser(userId, new ChatException(ChatErrorCode.INTERNAL_SERVER_ERROR, message));
    }

    /**
     * Principal이 null일 때 브로드캐스트로 에러를 전송합니다.
     */
    public void sendErrorBroadcast(ChatException exception) {
        try {
            WsEnvelope<WsEnvelope.ErrorPayload> errorResponse = new WsEnvelope<>(
                    "error",
                    WsEnvelope.newMessageId(),
                    System.currentTimeMillis(),
                    new WsEnvelope.ErrorPayload(exception.getErrorCodeString(), exception.getMessage())
            );

            messagingTemplate.convertAndSend("/topic/errors", errorResponse);
            log.info("에러 메시지를 브로드캐스트했습니다: " + exception.getErrorCodeString());

        } catch (Exception e) {
            log.severe("브로드캐스트 에러 메시지 전송 실패: " + e.getMessage());
        }
    }

    /**
     * 성공 응답을 사용자에게 전송합니다.
     */
    public <T> void sendSuccessToUser(String userId, String type, T payload) {
        try {
            WsEnvelope<T> response = new WsEnvelope<>(
                    type,
                    WsEnvelope.newMessageId(),
                    System.currentTimeMillis(),
                    payload
            );

            messagingTemplate.convertAndSendToUser(userId, "/queue/" + type.replace(".", "-"), response);

        } catch (Exception e) {
            log.severe("성공 메시지 전송 실패: " + e.getMessage());
        }
    }

    /**
     * 토픽에 메시지를 브로드캐스트합니다.
     */
    public <T> void sendToTopic(String topic, String type, T payload) {
        try {
            WsEnvelope<T> response = new WsEnvelope<>(
                    type,
                    WsEnvelope.newMessageId(),
                    System.currentTimeMillis(),
                    payload
            );

            messagingTemplate.convertAndSend(topic, response);

        } catch (Exception e) {
            log.severe("토픽 메시지 전송 실패: " + e.getMessage());
        }
    }
}