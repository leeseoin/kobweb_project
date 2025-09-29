package com.kob_backend_seoin.kob_backend.repository;

import com.kob_backend_seoin.kob_backend.domain.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {

    // 사용자 ID로 프로필 조회
    Optional<UserProfile> findByUserId(UUID userId);

    // 이메일로 프로필 조회
    Optional<UserProfile> findByEmail(String email);

    // 사용자 ID 존재 여부 확인
    boolean existsByUserId(UUID userId);

    // 이름으로 프로필 검색 (부분 일치)
    @Query("SELECT p FROM UserProfile p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<UserProfile> findByNameContainingIgnoreCase(@Param("name") String name);

    // 회사명으로 프로필 검색
    @Query("SELECT p FROM UserProfile p WHERE LOWER(p.company) LIKE LOWER(CONCAT('%', :company, '%'))")
    List<UserProfile> findByCompanyContainingIgnoreCase(@Param("company") String company);

    // 기술 스택으로 프로필 검색
    @Query("SELECT p FROM UserProfile p JOIN p.skills s WHERE LOWER(s) LIKE LOWER(CONCAT('%', :skill, '%'))")
    List<UserProfile> findBySkillsContainingIgnoreCase(@Param("skill") String skill);

    // 복합 검색 (이름, 이메일, 회사)
    @Query("SELECT p FROM UserProfile p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.company) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<UserProfile> searchProfiles(@Param("query") String query);
}