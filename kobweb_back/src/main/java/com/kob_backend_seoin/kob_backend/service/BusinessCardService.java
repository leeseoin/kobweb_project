package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.domain.BusinessCard;
import com.kob_backend_seoin.kob_backend.domain.Contact;
import com.kob_backend_seoin.kob_backend.domain.User;
import com.kob_backend_seoin.kob_backend.dto.BusinessCard.BusinessCardRequestDto;
import com.kob_backend_seoin.kob_backend.dto.BusinessCard.BusinessCardResponseDto;
import com.kob_backend_seoin.kob_backend.exception.CustomException;
import com.kob_backend_seoin.kob_backend.exception.ErrorCode;
import com.kob_backend_seoin.kob_backend.repository.BusinessCardRepository;
import com.kob_backend_seoin.kob_backend.repository.ContactRepository;
import com.kob_backend_seoin.kob_backend.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final FriendRequestService friendRequestService;
    private final ContactRepository contactRepository;

    @Autowired
    public BusinessCardService(BusinessCardRepository businessCardRepository,
                               UserRepository userRepository,
                               FriendRequestService friendRequestService,
                               ContactRepository contactRepository) {
        this.businessCardRepository = businessCardRepository;
        this.userRepository = userRepository;
        this.friendRequestService = friendRequestService;
        this.contactRepository = contactRepository;
    }

    // 명함 등록 (이메일로 실제 사용자 찾기)
    public BusinessCardResponseDto createBusinessCard(UUID creatorId, BusinessCardRequestDto dto) {
        System.out.println("=== BusinessCardService.createBusinessCard 호출됨 ===");
        System.out.println("creatorId: " + creatorId);
        System.out.println("dto.email: " + dto.getEmail());
        System.out.println("dto.name: " + dto.getName());

        BusinessCard card = new BusinessCard();

        // 이메일로 실제 사용자 찾기
        UUID targetUserId = creatorId; // 기본값은 현재 사용자 (자기 명함인 경우)

        // 이메일로 플랫폼 사용자 조회 시도
        Optional<User> targetUser = userRepository.findByEmail(dto.getEmail());

        if (targetUser.isPresent()) {
            // 플랫폼 사용자 발견 - 친구 요청 시스템으로 처리
            UUID platformUserId = targetUser.get().getId();
            System.out.println("플랫폼 사용자 발견: " + targetUser.get().getNickname() + " (ID: " + platformUserId + ")");

            // 친구 요청 발송
            String message = "명함을 통해 연락처를 추가하고 싶습니다.";
            friendRequestService.sendFriendRequest(creatorId, platformUserId, message);

            // 친구 요청이 발송되었음을 알리는 특별한 응답
            throw new CustomException(
                targetUser.get().getNickname() + "님에게 친구 요청을 보냈습니다. 수락되면 자동으로 연락처에 추가됩니다.",
                ErrorCode.FRIEND_REQUEST_SENT
            );
        } else {
            // 플랫폼에 없는 외부 연락처 - 현재 사용자의 명함으로 등록
            System.out.println("외부 연락처로 등록: " + dto.getEmail());
        }

        card.setUserId(targetUserId);
        card.setName(dto.getName());
        card.setEmail(dto.getEmail());
        card.setCompany(dto.getCompany());
        card.setPosition(dto.getPosition());
        card.setSkills(dto.getSkills());
        BusinessCard saved = businessCardRepository.save(card);

        System.out.println("명함 생성 완료 - 이름: " + dto.getName() + ", 설정된 userId: " + targetUserId);

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

        // 플랫폼 사용자의 명함인 경우, 관련 연락처도 삭제
        // 명함의 이메일로 플랫폼 사용자 찾기
        Optional<User> targetUser = userRepository.findByEmail(card.getEmail());
        if (targetUser.isPresent()) {
            UUID targetUserId = targetUser.get().getId();

            System.out.println("=== 명함 삭제와 함께 연락처 정리 ===");
            System.out.println("삭제할 명함 소유자: " + userId);
            System.out.println("명함 대상 사용자: " + targetUserId);

            // 양방향 연락처 삭제
            contactRepository.findByOwnerIdAndTargetUserId(userId, targetUserId)
                    .ifPresent(contact -> {
                        contactRepository.delete(contact);
                        System.out.println("연락처 삭제됨: " + userId + " -> " + targetUserId);
                    });

            contactRepository.findByOwnerIdAndTargetUserId(targetUserId, userId)
                    .ifPresent(contact -> {
                        contactRepository.delete(contact);
                        System.out.println("연락처 삭제됨: " + targetUserId + " -> " + userId);
                    });
        }

        businessCardRepository.delete(card);
        System.out.println("명함 삭제 완료: " + card.getName());
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