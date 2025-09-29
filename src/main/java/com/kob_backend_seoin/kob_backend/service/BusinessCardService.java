package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.domain.BusinessCard;
import com.kob_backend_seoin.kob_backend.dto.BusinessCard.BusinessCardRequestDto;
import com.kob_backend_seoin.kob_backend.dto.BusinessCard.BusinessCardResponseDto;
import com.kob_backend_seoin.kob_backend.exception.CustomException;
import com.kob_backend_seoin.kob_backend.exception.ErrorCode;
import com.kob_backend_seoin.kob_backend.repository.BusinessCardRepository;
import com.kob_backend_seoin.kob_backend.repository.UserRepository;
import com.kob_backend_seoin.kob_backend.domain.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BusinessCardService {
    private final BusinessCardRepository businessCardRepository;
    private final NetworkService networkService;
    private final UserRepository userRepository;

    // neo4j 연동
    @Autowired
    public BusinessCardService(BusinessCardRepository businessCardRepository, NetworkService networkService, UserRepository userRepository) {
        this.businessCardRepository = businessCardRepository;
        this.networkService = networkService;
        this.userRepository = userRepository;
    }

    // 명함 등록
    public BusinessCardResponseDto createBusinessCard(UUID userId, BusinessCardRequestDto dto) {
        BusinessCard card = new BusinessCard();
        card.setUserId(userId);
        card.setName(dto.getName());
        card.setEmail(dto.getEmail());
        card.setCompany(dto.getCompany());
        card.setPosition(dto.getPosition());
        card.setSkills(dto.getSkills());
        BusinessCard saved = businessCardRepository.save(card);

        try {
            // 이메일 기반으로 deterministic UUID 생성
            UUID friendUserId = UUID.nameUUIDFromBytes(dto.getEmail().getBytes());

            // 1. 명함 주인의 Person 노드 생성
            networkService.createPersonFromBusinessCard(friendUserId, dto.getName(), dto.getEmail(), dto.getCompany(), dto.getPosition());

            // 2. 명함 추가한 사람(나)의 Person 노드도 생성 (없으면)
            Optional<User> currentUser = userRepository.findById(userId);
            if (currentUser.isPresent()) {
                User user = currentUser.get();
                networkService.createPersonFromBusinessCard(userId, user.getNickname(), user.getEmail(), "", "");
            }

            // 3. 친구 관계 생성: 나 -> 명함 주인
            networkService.addFriendConnection(userId, friendUserId);

            System.out.println("✅ 친구 관계 생성: " + userId + " -> " + dto.getName());
        } catch (Exception e) {
            System.err.println("❌ Neo4j 연동 실패 (명함은 정상 저장됨): " + e.getMessage());
        }

        return toDto(saved);
    }

    // 내가 등록한 명함 목록 조회 (검색/회사 필터)
    public List<BusinessCardResponseDto> getMyBusinessCards(UUID userId, String query, String company) {
        List<BusinessCard> cards = businessCardRepository.findByUserId(userId);
        return cards.stream()
                .filter(card -> (query == null || card.getName().contains(query) || card.getEmail().contains(query))
                        && (company == null || (card.getCompany() != null && card.getCompany().contains(company))))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // 명함 상세 조회
    public BusinessCardResponseDto getBusinessCard(UUID userId, UUID businessCardId) {
        BusinessCard card = businessCardRepository.findById(businessCardId)
                .orElseThrow(() -> new CustomException("명함을 찾을 수 없습니다.", ErrorCode.NOT_FOUND));
        if (!card.getUserId().equals(userId)) {
            throw new CustomException("권한이 없습니다.", ErrorCode.FORBIDDEN);
        }
        return toDto(card);
    }

    // 명함 수정
    public BusinessCardResponseDto updateBusinessCard(UUID userId, UUID businessCardId, BusinessCardRequestDto dto) {
        BusinessCard card = businessCardRepository.findById(businessCardId)
                .orElseThrow(() -> new CustomException("명함을 찾을 수 없습니다.", ErrorCode.NOT_FOUND));
        if (!card.getUserId().equals(userId)) {
            throw new CustomException("권한이 없습니다.", ErrorCode.FORBIDDEN);
        }
        if (dto.getName() != null) card.setName(dto.getName());
        if (dto.getEmail() != null) card.setEmail(dto.getEmail());
        if (dto.getCompany() != null) card.setCompany(dto.getCompany());
        if (dto.getPosition() != null) card.setPosition(dto.getPosition());
        if (dto.getSkills() != null) card.setSkills(dto.getSkills());
        card.setUpdatedAt(LocalDateTime.now());
        BusinessCard updated = businessCardRepository.save(card);
        return toDto(updated);
    }

    // 명함 삭제
    public void deleteBusinessCard(UUID userId, UUID businessCardId) {
        BusinessCard card = businessCardRepository.findById(businessCardId)
                .orElseThrow(() -> new CustomException("명함을 찾을 수 없습니다.", ErrorCode.NOT_FOUND));
        if (!card.getUserId().equals(userId)) {
            throw new CustomException("권한이 없습니다.", ErrorCode.FORBIDDEN);
        }
        businessCardRepository.delete(card);
    }

    // 명함 공유 링크 생성 (간단 예시)
    public String createShareableUrl(UUID userId, UUID businessCardId) {
        BusinessCard card = businessCardRepository.findById(businessCardId)
                .orElseThrow(() -> new CustomException("명함을 찾을 수 없습니다.", ErrorCode.NOT_FOUND));
        if (!card.getUserId().equals(userId)) {
            throw new CustomException("권한이 없습니다.", ErrorCode.FORBIDDEN);
        }
        // 실제 서비스에서는 DB에 공유 이력/만료시간 저장 필요
        String shareId = businessCardId.toString().replaceAll("-", "").substring(0, 10);
        return "https://kobweb.com/card/" + shareId;
    }

    private BusinessCardResponseDto toDto(BusinessCard card) {
        BusinessCardResponseDto dto = new BusinessCardResponseDto();
        dto.setBusinessCardId(card.getBusinessCardId().toString());
        dto.setName(card.getName());
        dto.setEmail(card.getEmail());
        dto.setCompany(card.getCompany());
        dto.setPosition(card.getPosition());
        dto.setSkills(card.getSkills());
        dto.setCreatedAt(card.getCreatedAt());
        dto.setUpdatedAt(card.getUpdatedAt());
        return dto;
    }
} 