package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.domain.ChatMessage;
import com.kob_backend_seoin.kob_backend.domain.ChatRoom;
import com.kob_backend_seoin.kob_backend.domain.User;
import com.kob_backend_seoin.kob_backend.repository.ChatRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.logging.Logger;

/**
 * 채팅 메시지 영속성 서비스
 *
 * JdbcTemplate을 사용하여 Spring 트랜잭션 추상화 우회
 * JDBC auto-commit으로 즉시 DB에 반영
 */
@Service
public class ChatMessagePersistenceService {

    private static final Logger log = Logger.getLogger(ChatMessagePersistenceService.class.getName());

    private final JdbcTemplate jdbcTemplate;
    private final ChatRoomRepository chatRoomRepository;

    @Autowired
    public ChatMessagePersistenceService(JdbcTemplate jdbcTemplate,
                                        ChatRoomRepository chatRoomRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.chatRoomRepository = chatRoomRepository;
    }

    /**
     * JdbcTemplate으로 직접 INSERT (트랜잭션 우회)
     * auto-commit으로 즉시 DB에 저장됨
     */
    public ChatMessage saveMessageInTransaction(String content, User sender, UUID chatRoomId, String clientMessageId) {
        log.info("=== 트랜잭션 서비스: 메시지 저장 시작 ===");
        log.info("현재 스레드: " + Thread.currentThread().getName());

        try {
            // 채팅방 조회
            ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                    .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + chatRoomId));

            log.info("채팅방 조회 완료: " + chatRoom.getName());

            // 현재 sequence 가져오기
            Long currentSequence = chatRoom.getNextSequence();
            if (currentSequence == null) {
                currentSequence = 1L;
            }

            log.info("현재 Sequence: " + currentSequence);

            // UUID 및 타임스탬프 생성
            UUID messageId = UUID.randomUUID();
            Timestamp sentAt = new Timestamp(System.currentTimeMillis());

            log.info("메시지 저장 준비:");
            log.info("  - Message ID: " + messageId);
            log.info("  - Content: " + content);
            log.info("  - Sender ID: " + sender.getId());
            log.info("  - ChatRoom ID: " + chatRoomId);
            log.info("  - Sequence: " + currentSequence);
            log.info("  - ClientMessageId: " + clientMessageId);

            // 직접 INSERT 쿼리 실행 (Spring 트랜잭션 우회)
            String insertSql = "INSERT INTO chat_messages (id, content, sender_id, chat_room_id, sent_at, sequence, client_message_id) " +
                               "VALUES (?, ?, ?, ?, ?, ?, ?)";

            int rowsAffected = jdbcTemplate.update(insertSql,
                messageId,
                content,
                sender.getId(),
                chatRoomId,
                sentAt,
                currentSequence,
                clientMessageId
            );

            log.info("JdbcTemplate INSERT 완료. Rows affected: " + rowsAffected);

            // ChatRoom의 nextSequence 업데이트
            String updateSql = "UPDATE chat_rooms SET next_sequence = ? WHERE id = ?";
            jdbcTemplate.update(updateSql, currentSequence + 1, chatRoomId);

            log.info("Sequence 증가 완료: " + currentSequence + " -> " + (currentSequence + 1));

            // ChatMessage 객체 생성하여 반환
            ChatMessage message = new ChatMessage(content, sender, chatRoom);
            message.setId(messageId);
            message.setSequence(currentSequence);
            message.setClientMessageId(clientMessageId);
            message.setSentAt(LocalDateTime.now());

            log.info("=== JdbcTemplate: 메시지 저장 완료 ===");
            log.info("Saved Message ID: " + messageId);
            log.info("Saved Message SentAt: " + sentAt);
            log.info("Saved Message Sequence: " + currentSequence);

            return message;

        } catch (Exception e) {
            log.severe("JdbcTemplate: 메시지 저장 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("메시지 저장 실패", e);
        }
    }
}
