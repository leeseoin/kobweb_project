package com.kob_backend_seoin.kob_backend.repository;

import com.kob_backend_seoin.kob_backend.domain.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    
    // 채팅방의 모든 메시지 조회 (최신순, Fetch Join 적용)
    @Query("SELECT cm FROM ChatMessage cm " +
           "LEFT JOIN FETCH cm.sender " +
           "LEFT JOIN FETCH cm.chatRoom " +
           "WHERE cm.chatRoom.id = :roomId ORDER BY cm.sequence DESC")
    Page<ChatMessage> findByChatRoomIdOrderBySentAtDesc(@Param("roomId") UUID roomId, Pageable pageable);
    
    // 채팅방의 모든 메시지 조회 (오래된순)
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom.id = :roomId ORDER BY cm.sequence ASC")
    Page<ChatMessage> findByChatRoomIdOrderBySentAtAsc(@Param("roomId") UUID roomId, Pageable pageable);
    
    // 특정 메시지 ID 이전의 메시지들 조회 (무한 스크롤용, Fetch Join 적용)
    @Query("SELECT cm FROM ChatMessage cm " +
           "LEFT JOIN FETCH cm.sender " +
           "LEFT JOIN FETCH cm.chatRoom " +
           "WHERE cm.chatRoom.id = :roomId AND cm.sequence < :lastSeq ORDER BY cm.sequence DESC")
    Page<ChatMessage> findByChatRoomIdAndSequenceBeforeOrderBySequenceDesc(
            @Param("roomId") UUID roomId,
            @Param("lastSeq") long lastSeq,
            Pageable pageable);
    
    // 채팅방의 마지막 메시지 조회 (Spring Data JPA 메서드명 규칙 사용)
    Optional<ChatMessage> findTop1ByChatRoomIdOrderBySequenceDesc(@Param("roomId") UUID roomId);
    
    // 채팅방의 메시지 개수 조회
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.chatRoom.id = :roomId")
    long countByChatRoomId(@Param("roomId") UUID roomId);
    
    // 특정 시간 이후의 메시지들 조회
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom.id = :roomId AND cm.sentAt > :since ORDER BY cm.sequence ASC")
    List<ChatMessage> findByChatRoomIdAndSentAtAfterOrderBySentAtAsc(
            @Param("roomId") UUID roomId, 
            @Param("since") java.time.LocalDateTime since);
    
    // 발신자별 메시지 조회
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom.id = :roomId AND cm.sender.id = :senderId ORDER BY cm.sequence DESC")
    Page<ChatMessage> findByChatRoomIdAndSenderIdOrderBySentAtDesc(
            @Param("roomId") UUID roomId, 
            @Param("senderId") UUID senderId, 
            Pageable pageable);

    Optional<ChatMessage> findByChatRoom_IdAndClientMessageId(UUID roomId, String clientMessageId);
} 