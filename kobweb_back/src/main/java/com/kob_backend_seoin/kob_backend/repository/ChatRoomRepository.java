package com.kob_backend_seoin.kob_backend.repository;

import com.kob_backend_seoin.kob_backend.domain.ChatRoom;
import com.kob_backend_seoin.kob_backend.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {
    
    // 사용자가 참여한 모든 채팅방 조회
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.participants p WHERE p.id = :userId ORDER BY cr.createdAt DESC")
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
    
    // 채팅방 이름으로 검색 (사용자가 참여한 채팅방 중에서)
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.participants p WHERE p.id = :userId AND cr.name LIKE %:keyword% ORDER BY cr.createdAt DESC")
    Page<ChatRoom> findByParticipantIdAndNameContaining(@Param("userId") UUID userId, @Param("keyword") String keyword, Pageable pageable);
} 