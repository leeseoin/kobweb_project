package com.kob_backend_seoin.kob_backend.repository;

import com.kob_backend_seoin.kob_backend.domain.MessageReadId;
import com.kob_backend_seoin.kob_backend.domain.MessageReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageReadStatusRepository extends JpaRepository<MessageReadStatus, MessageReadId> {

    // 특정 메시지의 읽음 상태 조회
    @Query("SELECT mrs FROM MessageReadStatus mrs " +
           "LEFT JOIN FETCH mrs.user " +
           "WHERE mrs.message.id = :messageId")
    List<MessageReadStatus> findByMessageId(@Param("messageId") UUID messageId);

    // 사용자가 특정 채팅방에서 읽지 않은 메시지 수 조회
    @Query("SELECT COUNT(m) FROM ChatMessage m " +
           "WHERE m.chatRoom.id = :roomId " +
           "AND m.sender.id != :userId " +
           "AND NOT EXISTS (" +
           "    SELECT mrs FROM MessageReadStatus mrs " +
           "    WHERE mrs.message.id = m.id AND mrs.user.id = :userId" +
           ")")
    long countUnreadMessagesInRoom(@Param("roomId") UUID roomId, @Param("userId") UUID userId);

    // 사용자가 읽지 않은 모든 메시지 수 조회
    @Query("SELECT COUNT(m) FROM ChatMessage m " +
           "JOIN m.chatRoom.participants p " +
           "WHERE p.id = :userId " +
           "AND m.sender.id != :userId " +
           "AND NOT EXISTS (" +
           "    SELECT mrs FROM MessageReadStatus mrs " +
           "    WHERE mrs.message.id = m.id AND mrs.user.id = :userId" +
           ")")
    long countTotalUnreadMessages(@Param("userId") UUID userId);

    // 특정 채팅방의 메시지들 중 읽지 않은 메시지 ID 목록 조회
    @Query("SELECT m.id FROM ChatMessage m " +
           "WHERE m.chatRoom.id = :roomId " +
           "AND m.sender.id != :userId " +
           "AND NOT EXISTS (" +
           "    SELECT mrs FROM MessageReadStatus mrs " +
           "    WHERE mrs.message.id = m.id AND mrs.user.id = :userId" +
           ")")
    List<UUID> findUnreadMessageIdsInRoom(@Param("roomId") UUID roomId, @Param("userId") UUID userId);

    // 사용자가 특정 메시지를 읽었는지 확인
    @Query("SELECT COUNT(mrs) > 0 FROM MessageReadStatus mrs " +
           "WHERE mrs.message.id = :messageId AND mrs.user.id = :userId")
    boolean existsByMessageIdAndUserId(@Param("messageId") UUID messageId, @Param("userId") UUID userId);

    // 채팅방별 읽지 않은 메시지 수 조회 (사용자의 모든 채팅방)
    @Query("SELECT m.chatRoom.id, COUNT(m) FROM ChatMessage m " +
           "JOIN m.chatRoom.participants p " +
           "WHERE p.id = :userId " +
           "AND m.sender.id != :userId " +
           "AND NOT EXISTS (" +
           "    SELECT mrs FROM MessageReadStatus mrs " +
           "    WHERE mrs.message.id = m.id AND mrs.user.id = :userId" +
           ") " +
           "GROUP BY m.chatRoom.id")
    List<Object[]> getUnreadCountsByRoomForUser(@Param("userId") UUID userId);

    // 특정 시간 이후의 읽지 않은 메시지들 조회
    @Query("SELECT m FROM ChatMessage m " +
           "JOIN m.chatRoom.participants p " +
           "WHERE p.id = :userId " +
           "AND m.sender.id != :userId " +
           "AND m.sentAt > :since " +
           "AND NOT EXISTS (" +
           "    SELECT mrs FROM MessageReadStatus mrs " +
           "    WHERE mrs.message.id = m.id AND mrs.user.id = :userId" +
           ")")
    List<UUID> findUnreadMessagesSince(@Param("userId") UUID userId,
                                     @Param("since") java.time.LocalDateTime since);

    // 특정 메시지를 읽은 사용자 목록 조회
    @Query("SELECT mrs.user FROM MessageReadStatus mrs " +
           "WHERE mrs.message.id = :messageId " +
           "ORDER BY mrs.readAt DESC")
    List<UUID> findUsersWhoReadMessage(@Param("messageId") UUID messageId);

    // 오래된 읽음 상태 데이터 정리 (관리용)
    @Query("DELETE FROM MessageReadStatus mrs " +
           "WHERE mrs.message.sentAt < :cutoffDate")
    void deleteOldReadStatus(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);
}