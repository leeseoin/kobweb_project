package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.domain.ChatMessage;
import com.kob_backend_seoin.kob_backend.domain.ChatRoom;
import com.kob_backend_seoin.kob_backend.domain.User;
import com.kob_backend_seoin.kob_backend.repository.ChatMessageRepository;
import com.kob_backend_seoin.kob_backend.repository.ChatRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.logging.Logger;

@Service
public class ChatMessageService {

    private static final Logger log = Logger.getLogger(ChatMessageService.class.getName());

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;

    @Autowired
    public ChatMessageService(ChatMessageRepository chatMessageRepository, ChatRoomRepository chatRoomRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.chatRoomRepository = chatRoomRepository;
    }

    @Transactional(transactionManager = "jpaTransactionManager")
    public ChatMessage saveMessage(String content, User sender, ChatRoom chatRoom, long sequence, String clientMessageId) {
        log.info("=== ChatMessageService: 메시지 저장 시작 ===");

        // 메시지 생성
        ChatMessage message = new ChatMessage(content, sender, chatRoom);
        message.setSequence(sequence);
        message.setClientMessageId(clientMessageId);

        log.info("Message content: " + message.getContent());
        log.info("Sender ID: " + message.getSender().getId());
        log.info("ChatRoom ID: " + message.getChatRoom().getId());
        log.info("Sequence: " + message.getSequence());
        log.info("ClientMessageId: " + message.getClientMessageId());

        // 메시지 저장 (JPA 트랜잭션 내에서 실행)
        log.info("💾 save() 호출 시작...");
        ChatMessage savedMessage = chatMessageRepository.save(message);
        log.info("✅ save() 완료 - Saved Message ID: " + savedMessage.getId());

        // ChatRoom의 nextSequence 업데이트
        chatRoom.setNextSequence(sequence + 1);
        chatRoomRepository.save(chatRoom);
        log.info("✅ ChatRoom save() 완료 - nextSequence: " + chatRoom.getNextSequence());

        log.info("=== ChatMessageService: 메시지 저장 완료 ===");
        log.info("Saved Message ID: " + savedMessage.getId());
        log.info("Saved Message SentAt: " + savedMessage.getSentAt());
        log.info("ChatRoom nextSequence updated to: " + chatRoom.getNextSequence());

        return savedMessage;
    }
}