package com.kob_backend_seoin.kob_backend.repository;

import com.kob_backend_seoin.kob_backend.domain.Contact;
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
public interface ContactRepository extends JpaRepository<Contact, UUID> {

    // 소유자 ID로 연락처 목록 조회
    List<Contact> findByOwnerId(UUID ownerId);

    // 소유자 ID로 연락처 목록 조회 (페이지네이션)
    Page<Contact> findByOwnerId(UUID ownerId, Pageable pageable);

    // 소유자와 타겟 사용자로 연락처 조회
    Optional<Contact> findByOwnerIdAndTargetUserId(UUID ownerId, UUID targetUserId);

    // 소유자와 이메일로 연락처 조회
    Optional<Contact> findByOwnerIdAndEmail(UUID ownerId, String email);

    // 플랫폼 사용자인 연락처만 조회
    @Query("SELECT c FROM Contact c WHERE c.ownerId = :ownerId AND c.targetUserId IS NOT NULL")
    List<Contact> findPlatformUserContactsByOwnerId(@Param("ownerId") UUID ownerId);

    // 외부 연락처만 조회 (플랫폼 사용자가 아닌)
    @Query("SELECT c FROM Contact c WHERE c.ownerId = :ownerId AND c.targetUserId IS NULL")
    List<Contact> findExternalContactsByOwnerId(@Param("ownerId") UUID ownerId);

    // 연락처 검색 (이름, 이메일, 회사)
    @Query("SELECT c FROM Contact c WHERE c.ownerId = :ownerId AND (" +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.company) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Contact> searchContacts(@Param("ownerId") UUID ownerId, @Param("query") String query);

    // 회사별 연락처 조회
    @Query("SELECT c FROM Contact c WHERE c.ownerId = :ownerId AND LOWER(c.company) LIKE LOWER(CONCAT('%', :company, '%'))")
    List<Contact> findByOwnerIdAndCompanyContainingIgnoreCase(@Param("ownerId") UUID ownerId, @Param("company") String company);

    // 최근 연락한 연락처 조회
    @Query("SELECT c FROM Contact c WHERE c.ownerId = :ownerId AND c.lastContactedAt IS NOT NULL ORDER BY c.lastContactedAt DESC")
    List<Contact> findRecentlyContactedByOwnerId(@Param("ownerId") UUID ownerId, Pageable pageable);

    // 특정 기간 내에 추가된 연락처
    @Query("SELECT c FROM Contact c WHERE c.ownerId = :ownerId AND c.createdAt >= :since")
    List<Contact> findByOwnerIdAndCreatedAtAfter(@Param("ownerId") UUID ownerId, @Param("since") LocalDateTime since);

    // 특정 소스로 추가된 연락처
    @Query("SELECT c FROM Contact c WHERE c.ownerId = :ownerId AND c.source = :source")
    List<Contact> findByOwnerIdAndSource(@Param("ownerId") UUID ownerId, @Param("source") Contact.ContactSource source);

    // 연락처 수 조회
    @Query("SELECT COUNT(c) FROM Contact c WHERE c.ownerId = :ownerId")
    long countByOwnerId(@Param("ownerId") UUID ownerId);

    // 플랫폼 사용자 연락처 수 조회
    @Query("SELECT COUNT(c) FROM Contact c WHERE c.ownerId = :ownerId AND c.targetUserId IS NOT NULL")
    long countPlatformUserContactsByOwnerId(@Param("ownerId") UUID ownerId);
}