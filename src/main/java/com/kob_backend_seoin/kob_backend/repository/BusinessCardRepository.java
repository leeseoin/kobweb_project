package com.kob_backend_seoin.kob_backend.repository;

import com.kob_backend_seoin.kob_backend.domain.BusinessCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BusinessCardRepository extends JpaRepository<BusinessCard, UUID> {
    List<BusinessCard> findByUserId(UUID userId);
} 