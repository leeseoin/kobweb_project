package com.kob_backend_seoin.kob_backend.repository;

import com.kob_backend_seoin.kob_backend.domain.ChatRoom;
import com.kob_backend_seoin.kob_backend.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {
    
    // 사용자가 참여한 모든 채팅방 조회 (Fetch Join으로 N+1 방지)
    @Query("SELECT DISTINCT cr FROM ChatRoom cr " +
           "LEFT JOIN FETCH cr.participants " +
           "LEFT JOIN FETCH cr.creator " +
           "JOIN cr.participants p WHERE p.id = :userId ORDER BY cr.createdAt DESC")
    Page<ChatRoom> findByParticipantId(@Param("userId") UUID userId, Pageable pageable);
    
    // 사용자가 참여한 모든 채팅방 조회 (null 안전)
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.participants p WHERE p.id = :userId ORDER BY cr.createdAt DESC")
    Page<ChatRoom> findByParticipantIdSafe(@Param("userId") UUID userId, Pageable pageable);
    
    // 사용자가 참여한 모든 채팅방 ID 목록 조회
    @Query("SELECT cr.id FROM ChatRoom cr JOIN cr.participants p WHERE p.id = :userId")
    List<UUID> findChatRoomIdsByParticipantId(@Param("userId") UUID userId);
    
    // 사용자가 참여한 채팅방 개수 조회
    @Query("SELECT COUNT(cr) FROM ChatRoom cr JOIN cr.participants p WHERE p.id = :userId")
    long countByParticipantId(@Param("userId") UUID userId);
    
    // 채팅방 이름으로 검색 (사용자가 참여한 채팅방 중에서, Fetch Join 적용)
    @Query("SELECT DISTINCT cr FROM ChatRoom cr " +
           "LEFT JOIN FETCH cr.participants " +
           "LEFT JOIN FETCH cr.creator " +
           "JOIN cr.participants p WHERE p.id = :userId AND cr.name LIKE %:keyword% ORDER BY cr.createdAt DESC")
    Page<ChatRoom> findByParticipantIdAndNameContaining(@Param("userId") UUID userId, @Param("keyword") String keyword, Pageable pageable);

    // 특정 채팅방 조회 (참여자와 생성자 정보 포함)
    @Query("SELECT cr FROM ChatRoom cr " +
           "LEFT JOIN FETCH cr.participants " +
           "LEFT JOIN FETCH cr.creator " +
           "WHERE cr.id = :roomId")
    Optional<ChatRoom> findByIdWithParticipants(@Param("roomId") UUID roomId);

    // 사용자가 특정 채팅방에 참여하고 있는지 확인 (최적화된 쿼리)
    @Query("SELECT COUNT(p) > 0 FROM ChatRoom cr JOIN cr.participants p " +
           "WHERE cr.id = :roomId AND p.id = :userId")
    boolean isUserParticipant(@Param("roomId") UUID roomId, @Param("userId") UUID userId);
} 