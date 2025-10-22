package com.kob_backend_seoin.kob_backend.repository;

import com.kob_backend_seoin.kob_backend.domain.FriendRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, UUID> {

    // 특정 사용자가 보낸 친구 요청 목록
    List<FriendRequest> findBySenderId(UUID senderId);

    // 특정 사용자가 받은 친구 요청 목록
    List<FriendRequest> findByReceiverId(UUID receiverId);

    // 특정 사용자가 받은 대기 중인 친구 요청 목록
    List<FriendRequest> findByReceiverIdAndStatus(UUID receiverId, FriendRequest.RequestStatus status);

    // 특정 사용자가 보낸 대기 중인 친구 요청 목록
    List<FriendRequest> findBySenderIdAndStatus(UUID senderId, FriendRequest.RequestStatus status);

    // 두 사용자 간의 친구 요청 존재 여부 확인 (양방향)
    @Query("SELECT fr FROM FriendRequest fr WHERE " +
           "(fr.senderId = :userId1 AND fr.receiverId = :userId2) OR " +
           "(fr.senderId = :userId2 AND fr.receiverId = :userId1)")
    List<FriendRequest> findBetweenUsers(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);

    // 두 사용자 간의 대기 중인 친구 요청 확인
    @Query("SELECT fr FROM FriendRequest fr WHERE " +
           "((fr.senderId = :userId1 AND fr.receiverId = :userId2) OR " +
           "(fr.senderId = :userId2 AND fr.receiverId = :userId1)) AND " +
           "fr.status = 'PENDING'")
    Optional<FriendRequest> findPendingRequestBetweenUsers(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);

    // 특정 사용자 간의 최신 친구 요청 조회
    @Query("SELECT fr FROM FriendRequest fr WHERE " +
           "(fr.senderId = :senderId AND fr.receiverId = :receiverId) " +
           "ORDER BY fr.createdAt DESC")
    Optional<FriendRequest> findLatestRequest(@Param("senderId") UUID senderId, @Param("receiverId") UUID receiverId);

    // 받은 대기 중인 요청 수 조회
    @Query("SELECT COUNT(fr) FROM FriendRequest fr WHERE fr.receiverId = :userId AND fr.status = 'PENDING'")
    long countPendingReceivedRequests(@Param("userId") UUID userId);

    // 보낸 대기 중인 요청 수 조회
    @Query("SELECT COUNT(fr) FROM FriendRequest fr WHERE fr.senderId = :userId AND fr.status = 'PENDING'")
    long countPendingSentRequests(@Param("userId") UUID userId);

    // 특정 기간 내 요청 조회
    @Query("SELECT fr FROM FriendRequest fr WHERE fr.receiverId = :userId AND fr.sentAt >= :since")
    List<FriendRequest> findRecentRequestsByReceiver(@Param("userId") UUID userId, @Param("since") LocalDateTime since);

    // 페이지네이션으로 받은 요청 조회
    Page<FriendRequest> findByReceiverIdOrderByCreatedAtDesc(UUID receiverId, Pageable pageable);

    // 페이지네이션으로 보낸 요청 조회
    Page<FriendRequest> findBySenderIdOrderByCreatedAtDesc(UUID senderId, Pageable pageable);

    // 상태별 요청 조회
    @Query("SELECT fr FROM FriendRequest fr WHERE " +
           "(fr.senderId = :userId OR fr.receiverId = :userId) AND " +
           "fr.status = :status ORDER BY fr.updatedAt DESC")
    List<FriendRequest> findByUserAndStatus(@Param("userId") UUID userId, @Param("status") FriendRequest.RequestStatus status);
}