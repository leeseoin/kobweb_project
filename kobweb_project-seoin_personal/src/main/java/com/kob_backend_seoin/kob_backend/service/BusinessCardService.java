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
    private final com.kob_backend_seoin.kob_backend.repository.AlarmRepository alarmRepository;

    // neo4j 연동
    @Autowired
    public BusinessCardService(BusinessCardRepository businessCardRepository, NetworkService networkService, UserRepository userRepository, com.kob_backend_seoin.kob_backend.repository.AlarmRepository alarmRepository) {
        this.businessCardRepository = businessCardRepository;
        this.networkService = networkService;
        this.userRepository = userRepository;
        this.alarmRepository = alarmRepository;
    }

    // 명함 등록 요청 (상대방 승인 필요)
    public BusinessCardResponseDto createBusinessCard(UUID userId, BusinessCardRequestDto dto) {
        System.out.println("=== 명함 등록 요청 시작 ===");
        System.out.println("요청자 userId: " + userId);
        System.out.println("명함 등록 대상 - 이름: " + dto.getName());
        System.out.println("명함 등록 대상 - 이메일: " + dto.getEmail());
        System.out.println("명함 등록 대상 - 회사: " + dto.getCompany());
        System.out.println("명함 등록 대상 - 직책: " + dto.getPosition());

        // 요청자 정보 조회
        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));

        System.out.println("요청자 정보 - 닉네임: " + requester.getNickname());
        System.out.println("요청자 정보 - 이메일: " + requester.getEmail());

        // 자기 자신에게 명함 등록 방지
        if (requester.getEmail().equals(dto.getEmail())) {
            System.out.println("❌ 자기 자신에게 명함 등록 시도!");
            throw new CustomException("자기 자신의 명함은 등록할 수 없습니다.", ErrorCode.INVALID_INPUT);
        }

        // 이메일로 대상 사용자 찾기
        Optional<User> targetUserOpt = userRepository.findByEmail(dto.getEmail());
        System.out.println("대상 사용자 시스템 가입 여부: " + targetUserOpt.isPresent());

        BusinessCard card = new BusinessCard();
        card.setUserId(userId);
        card.setName(dto.getName());
        card.setEmail(dto.getEmail());
        card.setCompany(dto.getCompany());
        card.setPosition(dto.getPosition());
        card.setSkills(dto.getSkills());

        if (targetUserOpt.isPresent()) {
            // 대상 사용자가 시스템에 등록되어 있는 경우
            User targetUser = targetUserOpt.get();
            card.setTargetUserId(targetUser.getId());
            card.setStatus("PENDING"); // 승인 대기 상태

            BusinessCard saved = businessCardRepository.save(card);

            // 상대방에게 명함 등록 요청 알림 생성
            String alarmTitle = "새로운 명함 등록 요청";
            String alarmContent = requester.getNickname() + "님이 회원님의 명함을 등록하려고 합니다.";
            com.kob_backend_seoin.kob_backend.domain.Alarm alarm =
                com.kob_backend_seoin.kob_backend.domain.Alarm.createBusinessCardRequestAlarm(
                    targetUser.getId(), alarmTitle, alarmContent, saved.getBusinessCardId());
            alarmRepository.save(alarm);

            System.out.println("✅ 명함 등록 요청 생성: " + requester.getNickname() + " -> " + targetUser.getNickname());

            return toDto(saved);
        } else {
            // 대상 사용자가 시스템에 없는 경우 - 바로 수락된 상태로 저장
            card.setStatus("ACCEPTED");
            BusinessCard saved = businessCardRepository.save(card);

            System.out.println("✅ 명함 등록 (시스템 미가입자): " + dto.getName());

            return toDto(saved);
        }
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

    // 명함 등록 요청 수락
    public void acceptBusinessCardRequest(UUID businessCardId, UUID userId) {
        System.out.println("=== BusinessCardService.acceptBusinessCardRequest 호출됨 ===");
        System.out.println("businessCardId: " + businessCardId + ", userId: " + userId);

        BusinessCard card = businessCardRepository.findById(businessCardId)
                .orElseThrow(() -> new CustomException("명함을 찾을 수 없습니다.", ErrorCode.NOT_FOUND));

        // 요청 받은 사람인지 확인 (targetUserId가 현재 사용자인지)
        if (!userId.equals(card.getTargetUserId())) {
            throw new CustomException("이 명함 등록 요청을 수락할 권한이 없습니다.", ErrorCode.FORBIDDEN);
        }

        // 대기 중인 요청인지 확인
        if (!"PENDING".equals(card.getStatus())) {
            throw new CustomException("이미 처리된 명함 등록 요청입니다.", ErrorCode.INVALID_INPUT);
        }

        // 요청 수락
        card.setStatus("ACCEPTED");
        businessCardRepository.save(card);

        // 양방향 명함 생성 및 Neo4j 친구 관계 추가
        createMutualBusinessCardsAndConnection(card.getUserId(), userId);

        // 요청 보낸 사람에게 수락 알림
        User accepter = userRepository.findById(userId).orElse(null);
        if (accepter != null) {
            String alarmTitle = "명함 등록 요청 수락됨";
            String alarmContent = accepter.getNickname() + "님이 명함 등록 요청을 수락했습니다.";
            com.kob_backend_seoin.kob_backend.domain.Alarm acceptanceAlarm =
                com.kob_backend_seoin.kob_backend.domain.Alarm.createBusinessCardRequestAlarm(
                    card.getUserId(), alarmTitle, alarmContent, businessCardId);
            alarmRepository.save(acceptanceAlarm);
        }

        System.out.println("명함 등록 요청 수락 완료");
    }

    // 명함 등록 요청 거절
    public void rejectBusinessCardRequest(UUID businessCardId, UUID userId) {
        System.out.println("=== BusinessCardService.rejectBusinessCardRequest 호출됨 ===");

        BusinessCard card = businessCardRepository.findById(businessCardId)
                .orElseThrow(() -> new CustomException("명함을 찾을 수 없습니다.", ErrorCode.NOT_FOUND));

        // 요청 받은 사람인지 확인
        if (!userId.equals(card.getTargetUserId())) {
            throw new CustomException("이 명함 등록 요청을 거절할 권한이 없습니다.", ErrorCode.FORBIDDEN);
        }

        // 대기 중인 요청인지 확인
        if (!"PENDING".equals(card.getStatus())) {
            throw new CustomException("이미 처리된 명함 등록 요청입니다.", ErrorCode.INVALID_INPUT);
        }

        // 요청 거절 - 명함 삭제
        businessCardRepository.delete(card);

        System.out.println("명함 등록 요청 거절 완료");
    }

    // 양방향 명함 생성 및 Neo4j 친구 관계 추가
    private void createMutualBusinessCardsAndConnection(UUID user1Id, UUID user2Id) {
        User user1 = userRepository.findById(user1Id).orElse(null);
        User user2 = userRepository.findById(user2Id).orElse(null);

        if (user1 == null || user2 == null) {
            System.out.println("양방향 명함 생성 실패: 사용자 정보 없음");
            return;
        }

        // user2의 명함 목록에 user1 명함 추가 (역방향)
        BusinessCard businessCard2 = new BusinessCard();
        businessCard2.setUserId(user2Id);  // user2가 소유자
        businessCard2.setTargetUserId(user1Id);  // 실제 대상은 user1
        businessCard2.setName(user1.getNickname());
        businessCard2.setEmail(user1.getEmail());
        businessCard2.setCompany(""); // 기본값
        businessCard2.setPosition(""); // 기본값
        businessCard2.setStatus("ACCEPTED");
        businessCardRepository.save(businessCard2);

        // Neo4j 친구 관계 생성
        try {
            // 1. 양쪽 사용자의 Person 노드 생성 (없으면)
            networkService.createPersonFromBusinessCard(user1Id, user1.getNickname(), user1.getEmail(), "", "");
            networkService.createPersonFromBusinessCard(user2Id, user2.getNickname(), user2.getEmail(), "", "");

            // 2. 양방향 친구 관계 생성
            networkService.addFriendConnection(user1Id, user2Id);
            networkService.addFriendConnection(user2Id, user1Id);

            System.out.println("✅ Neo4j 친구 관계 생성: " + user1.getNickname() + " <-> " + user2.getNickname());
        } catch (Exception e) {
            System.err.println("❌ Neo4j 연동 실패 (명함은 정상 저장됨): " + e.getMessage());
        }

        System.out.println("양방향 명함 및 친구 관계 생성 완료: " + user1.getNickname() + " <-> " + user2.getNickname());
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