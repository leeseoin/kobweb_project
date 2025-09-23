package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.domain.Alarm;
import com.kob_backend_seoin.kob_backend.domain.BusinessCard;
import com.kob_backend_seoin.kob_backend.domain.Contact;
import com.kob_backend_seoin.kob_backend.domain.FriendRequest;
import com.kob_backend_seoin.kob_backend.domain.User;
import com.kob_backend_seoin.kob_backend.exception.CustomException;
import com.kob_backend_seoin.kob_backend.exception.ErrorCode;
import com.kob_backend_seoin.kob_backend.repository.AlarmRepository;
import com.kob_backend_seoin.kob_backend.repository.BusinessCardRepository;
import com.kob_backend_seoin.kob_backend.repository.ContactRepository;
import com.kob_backend_seoin.kob_backend.repository.FriendRequestRepository;
import com.kob_backend_seoin.kob_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;
    private final AlarmRepository alarmRepository;
    private final ContactRepository contactRepository;
    private final BusinessCardRepository businessCardRepository;

    @Autowired
    public FriendRequestService(
            FriendRequestRepository friendRequestRepository,
            UserRepository userRepository,
            AlarmRepository alarmRepository,
            ContactRepository contactRepository,
            BusinessCardRepository businessCardRepository) {
        this.friendRequestRepository = friendRequestRepository;
        this.userRepository = userRepository;
        this.alarmRepository = alarmRepository;
        this.contactRepository = contactRepository;
        this.businessCardRepository = businessCardRepository;
    }

    /**
     * 친구 요청 보내기
     */
    public FriendRequest sendFriendRequest(UUID senderId, UUID receiverId, String message) {
        System.out.println("=== FriendRequestService.sendFriendRequest 호출됨 ===");
        System.out.println("senderId: " + senderId + ", receiverId: " + receiverId);

        // 자기 자신에게 요청 방지
        if (senderId.equals(receiverId)) {
            throw new CustomException("자기 자신에게는 친구 요청을 보낼 수 없습니다.", ErrorCode.INVALID_INPUT);
        }

        // 사용자 존재 확인
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new CustomException("요청을 보내는 사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new CustomException("요청을 받을 사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));

        // 기존 대기 중인 요청 확인
        Optional<FriendRequest> existingRequest = friendRequestRepository.findPendingRequestBetweenUsers(senderId, receiverId);
        if (existingRequest.isPresent()) {
            throw new CustomException("이미 대기 중인 친구 요청이 있습니다.", ErrorCode.ALREADY_EXISTS);
        }

        // 이미 연락처로 등록되어 있는지 확인
        boolean isAlreadyContact = contactRepository.findByOwnerIdAndTargetUserId(senderId, receiverId).isPresent() ||
                                   contactRepository.findByOwnerIdAndTargetUserId(receiverId, senderId).isPresent();
        if (isAlreadyContact) {
            throw new CustomException("이미 연락처로 등록된 사용자입니다.", ErrorCode.ALREADY_EXISTS);
        }

        // 친구 요청 생성
        FriendRequest friendRequest = new FriendRequest(senderId, receiverId, message);
        FriendRequest savedRequest = friendRequestRepository.save(friendRequest);

        // CONNECTION 알림 생성
        String alarmTitle = "새로운 친구 요청";
        String alarmContent = sender.getNickname() + "님이 친구 요청을 보냈습니다.";
        if (message != null && !message.trim().isEmpty()) {
            alarmContent += "\n메시지: " + message;
        }

        Alarm connectionAlarm = Alarm.createConnectionAlarm(receiverId, alarmTitle, alarmContent, savedRequest.getRequestId());
        alarmRepository.save(connectionAlarm);

        System.out.println("친구 요청 생성 완료 - requestId: " + savedRequest.getRequestId());
        System.out.println("CONNECTION 알림 생성 완료 - alarmId: " + connectionAlarm.getAlarmId());

        return savedRequest;
    }

    /**
     * 친구 요청 수락
     */
    public void acceptFriendRequest(UUID requestId, UUID userId) {
        System.out.println("=== FriendRequestService.acceptFriendRequest 호출됨 ===");
        System.out.println("requestId: " + requestId + ", userId: " + userId);

        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException("친구 요청을 찾을 수 없습니다.", ErrorCode.NOT_FOUND));

        // 요청 받은 사람인지 확인
        if (!request.getReceiverId().equals(userId)) {
            throw new CustomException("이 친구 요청을 수락할 권한이 없습니다.", ErrorCode.FORBIDDEN);
        }

        // 대기 중인 요청인지 확인
        if (!request.isPending()) {
            throw new CustomException("이미 처리된 친구 요청입니다.", ErrorCode.INVALID_INPUT);
        }

        // 요청 수락
        request.accept();
        friendRequestRepository.save(request);

        // 양방향 연락처 생성
        createMutualContacts(request.getSenderId(), request.getReceiverId());

        // 요청 보낸 사람에게 수락 알림
        User receiver = userRepository.findById(request.getReceiverId()).orElse(null);
        if (receiver != null) {
            String alarmTitle = "친구 요청 수락됨";
            String alarmContent = receiver.getNickname() + "님이 친구 요청을 수락했습니다.";
            Alarm acceptanceAlarm = Alarm.createConnectionAlarm(request.getSenderId(), alarmTitle, alarmContent, requestId);
            alarmRepository.save(acceptanceAlarm);
        }

        System.out.println("친구 요청 수락 완료");
    }

    /**
     * 친구 요청 거절
     */
    public void rejectFriendRequest(UUID requestId, UUID userId) {
        System.out.println("=== FriendRequestService.rejectFriendRequest 호출됨 ===");

        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException("친구 요청을 찾을 수 없습니다.", ErrorCode.NOT_FOUND));

        // 요청 받은 사람인지 확인
        if (!request.getReceiverId().equals(userId)) {
            throw new CustomException("이 친구 요청을 거절할 권한이 없습니다.", ErrorCode.FORBIDDEN);
        }

        // 대기 중인 요청인지 확인
        if (!request.isPending()) {
            throw new CustomException("이미 처리된 친구 요청입니다.", ErrorCode.INVALID_INPUT);
        }

        // 요청 거절
        request.reject();
        friendRequestRepository.save(request);

        System.out.println("친구 요청 거절 완료");
    }

    /**
     * 친구 요청 취소 (보낸 사람이 취소)
     */
    public void cancelFriendRequest(UUID requestId, UUID userId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException("친구 요청을 찾을 수 없습니다.", ErrorCode.NOT_FOUND));

        // 요청 보낸 사람인지 확인
        if (!request.getSenderId().equals(userId)) {
            throw new CustomException("이 친구 요청을 취소할 권한이 없습니다.", ErrorCode.FORBIDDEN);
        }

        // 대기 중인 요청인지 확인
        if (!request.isPending()) {
            throw new CustomException("이미 처리된 친구 요청입니다.", ErrorCode.INVALID_INPUT);
        }

        // 요청 취소
        request.cancel();
        friendRequestRepository.save(request);
    }

    /**
     * 받은 친구 요청 목록 조회
     */
    public List<FriendRequest> getReceivedRequests(UUID userId) {
        return friendRequestRepository.findByReceiverIdAndStatus(userId, FriendRequest.RequestStatus.PENDING);
    }

    /**
     * 보낸 친구 요청 목록 조회
     */
    public List<FriendRequest> getSentRequests(UUID userId) {
        return friendRequestRepository.findBySenderIdAndStatus(userId, FriendRequest.RequestStatus.PENDING);
    }

    /**
     * 양방향 연락처 및 명함 생성 (친구 요청 수락 시)
     */
    private void createMutualContacts(UUID user1Id, UUID user2Id) {
        User user1 = userRepository.findById(user1Id).orElse(null);
        User user2 = userRepository.findById(user2Id).orElse(null);

        if (user1 == null || user2 == null) {
            System.out.println("연락처 생성 실패: 사용자 정보 없음");
            return;
        }

        // user1의 연락처에 user2 추가
        Contact contact1 = new Contact(user1Id, user2.getNickname(), user2.getEmail());
        contact1.setTargetUserId(user2Id);
        contact1.setSource(Contact.ContactSource.PLATFORM);
        contactRepository.save(contact1);

        // user2의 연락처에 user1 추가
        Contact contact2 = new Contact(user2Id, user1.getNickname(), user1.getEmail());
        contact2.setTargetUserId(user1Id);
        contact2.setSource(Contact.ContactSource.PLATFORM);
        contactRepository.save(contact2);

        // user1의 명함 목록에 user2 명함 추가
        BusinessCard businessCard1 = new BusinessCard();
        businessCard1.setUserId(user1Id);  // user1이 소유자
        businessCard1.setTargetUserId(user2Id);  // 실제 대상은 user2
        businessCard1.setName(user2.getNickname());
        businessCard1.setEmail(user2.getEmail());
        businessCard1.setCompany(""); // 기본값
        businessCard1.setPosition(""); // 기본값
        businessCardRepository.save(businessCard1);

        // user2의 명함 목록에 user1 명함 추가
        BusinessCard businessCard2 = new BusinessCard();
        businessCard2.setUserId(user2Id);  // user2가 소유자
        businessCard2.setTargetUserId(user1Id);  // 실제 대상은 user1
        businessCard2.setName(user1.getNickname());
        businessCard2.setEmail(user1.getEmail());
        businessCard2.setCompany(""); // 기본값
        businessCard2.setPosition(""); // 기본값
        businessCardRepository.save(businessCard2);

        System.out.println("양방향 연락처 및 명함 생성 완료: " + user1.getNickname() + " <-> " + user2.getNickname());
    }
}