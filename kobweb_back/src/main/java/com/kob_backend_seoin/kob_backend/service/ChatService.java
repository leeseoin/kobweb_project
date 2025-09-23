package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.domain.BusinessCard;
import com.kob_backend_seoin.kob_backend.domain.ChatMessage;
import com.kob_backend_seoin.kob_backend.domain.ChatRoom;
import com.kob_backend_seoin.kob_backend.domain.User;
import com.kob_backend_seoin.kob_backend.dto.Chat.ChatMessageRequestDto;
import com.kob_backend_seoin.kob_backend.dto.Chat.ChatMessageResponseDto;
import com.kob_backend_seoin.kob_backend.dto.Chat.ChatRoomResponseDto;
import com.kob_backend_seoin.kob_backend.exception.CustomException;
import com.kob_backend_seoin.kob_backend.exception.ErrorCode;
import com.kob_backend_seoin.kob_backend.repository.BusinessCardRepository;
import com.kob_backend_seoin.kob_backend.repository.ChatMessageRepository;
import com.kob_backend_seoin.kob_backend.repository.ChatRoomRepository;
import com.kob_backend_seoin.kob_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.cache.annotation.Cacheable;
// import org.springframework.cache.annotation.CacheEvict;
// import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
// import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatService {
    
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final BusinessCardRepository businessCardRepository;
    // private final ManualCacheService manualCacheService;
    // private final CacheManager cacheManager;
    
    // 자기 자신을 주입하여 프록시를 통해 호출
    @Autowired
    @Lazy
    private ChatService self;

    @Autowired
    public ChatService(ChatRoomRepository chatRoomRepository,
                       ChatMessageRepository chatMessageRepository,
                       UserRepository userRepository,
                       BusinessCardRepository businessCardRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.businessCardRepository = businessCardRepository;
        // this.manualCacheService = manualCacheService;
        // this.cacheManager = cacheManager;
    }

    // Spring Cache 테스트 메서드 - 캐시 비활성화
    // @Cacheable(value = "testCache", key = "#testKey")
    public String testCache(String testKey) {
        System.out.println("=== 테스트 캐시 메서드 호출됨 (캐시 미스) ===");
        System.out.println("testKey: " + testKey);
        System.out.println("현재 시간: " + System.currentTimeMillis());
        return "테스트 결과: " + testKey + " - " + System.currentTimeMillis();
    }
    
    // Spring Cache 디버깅 메서드 - 단순화된 테스트
    // @Cacheable(value = "debugCache", key = "#key")
    public String debugCache(String key) {
        
        return "Debug result for: " + key;
    }
    
    // 수동 캐시 테스트 메서드 (캐시 비활성화)
    public String manualCacheTest(String key) {
        System.out.println("=== MANUAL CACHE TEST (DISABLED) ===");
        System.out.println("Key: " + key);
        
        // 캐시에서 조회 시도 (비활성화)
        // Optional<String> cachedResult = manualCacheService.get(key, String.class);
        
        // if (cachedResult.isPresent()) {
        //     System.out.println("=== MANUAL CACHE HIT ===");
        //     return cachedResult.get();
        // } else {
            System.out.println("=== MANUAL CACHE MISS (DISABLED) ===");
            String result = "Manual cache result for: " + key + " - " + System.currentTimeMillis();
            
            // 캐시에 저장 (비활성화)
            // manualCacheService.put(key, result);
            
            return result;
        // }
    }
    
    // 프록시를 통한 캐시 테스트 메서드
    public String debugCacheWithProxy(String key) {
        System.out.println("=== DEBUG CACHE WITH PROXY ===");
        System.out.println("Calling self.debugCache() through proxy...");
        return self.debugCache(key);
    }
    
    // Spring Cache 프록시 확인 메서드
    public String checkCacheProxy() {
        System.out.println("=== Cache Proxy Check ===");
        System.out.println("This class: " + this.getClass().getName());
        System.out.println("Is CGLIB proxy: " + this.getClass().getName().contains("$$"));
        System.out.println("Is Spring proxy: " + (this.getClass().getName().contains("$$EnhancerBySpringCGLIB")));
        return "Proxy check completed";
    }

    // 사용자의 채팅방 목록 조회 (Page 객체는 캐싱하지 않음)
    public Page<ChatRoomResponseDto> getUserChatRooms(UUID userId, int page, int size) {
        
        if (userId == null) {
            throw new CustomException("사용자 ID가 제공되지 않았습니다.", ErrorCode.INVALID_INPUT);
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatRoom> chatRooms = chatRoomRepository.findByParticipantId(userId, pageable);

        Page<ChatRoomResponseDto> result = chatRooms.map(chatRoom -> {
            // 마지막 메시지 조회
            Optional<ChatMessage> lastMessageOpt = chatMessageRepository.findTop1ByChatRoomIdOrderBySequenceDesc(chatRoom.getId());
            ChatMessageResponseDto lastMessageDto = null;
            if (lastMessageOpt.isPresent()) {
                ChatMessage lastMessage = lastMessageOpt.get();
                lastMessageDto = convertToMessageResponseDto(lastMessage);
            }

            // 안 읽은 메시지 수 계산 (임시로 0으로 설정, 실제로는 읽음 상태 테이블 필요)
            long unreadCount = 0;

            return convertToRoomResponseDto(chatRoom, lastMessageDto, unreadCount);
        });
        
        return result;
    }
    
    // 캐시용 내부 메서드 - List 반환
    // @Cacheable(value = "userChatRoomsList", key = "#userId + '_' + #page + '_' + #size")
    public List<ChatRoomResponseDto> getUserChatRoomsList(UUID userId, int page, int size) {
        System.out.println("=== DB에서 채팅방 목록 조회 (List, 캐시 미스) ===");
        
        if (userId == null) {
            throw new CustomException("사용자 ID가 제공되지 않았습니다.", ErrorCode.INVALID_INPUT);
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatRoom> chatRooms = chatRoomRepository.findByParticipantId(userId, pageable);

        List<ChatRoomResponseDto> result = chatRooms.getContent().stream().map(chatRoom -> {
            // 마지막 메시지 조회
            Optional<ChatMessage> lastMessageOpt = chatMessageRepository.findTop1ByChatRoomIdOrderBySequenceDesc(chatRoom.getId());
            ChatMessageResponseDto lastMessageDto = null;
            if (lastMessageOpt.isPresent()) {
                ChatMessage lastMessage = lastMessageOpt.get();
                lastMessageDto = convertToMessageResponseDto(lastMessage);
            }

            // 안 읽은 메시지 수 계산 (임시로 0으로 설정, 실제로는 읽음 상태 테이블 필요)
            long unreadCount = 0;

            return convertToRoomResponseDto(chatRoom, lastMessageDto, unreadCount);
        }).collect(Collectors.toList());
        
        return result;
    }

    // 특정 채팅방의 메시지 내역 조회 (Page 객체는 캐싱하지 않음)
    public Page<ChatMessageResponseDto> getChatRoomMessages(UUID userId, UUID roomId,
                                                           UUID lastMessageId, int size) {
        System.out.println("=== DB에서 채팅방 메시지 조회 (캐시 미스) ===");
        System.out.println("roomId: " + roomId + ", lastMessageId: " + lastMessageId + ", size: " + size);
        
        // 사용자가 해당 채팅방에 참여하고 있는지 확인
        validateUserInChatRoom(userId, roomId);

        Pageable pageable = PageRequest.of(0, size);
        Page<ChatMessage> messages;

        if (lastMessageId != null) {
            // messageId를 sequence로 변환하여 커서 조회는 sequence 기준으로 수행
            ChatMessage last = chatMessageRepository.findById(lastMessageId)
                    .orElseThrow(() -> new CustomException("메시지를 찾을 수 없습니다.", ErrorCode.NOT_FOUND));
            messages = chatMessageRepository.findByChatRoomIdAndSequenceBeforeOrderBySequenceDesc(roomId, last.getSequence(), pageable);
        } else {
            messages = chatMessageRepository.findByChatRoomIdOrderBySentAtDesc(roomId, pageable);
        }

        Page<ChatMessageResponseDto> result = messages.map(this::convertToMessageResponseDto);
        
        return result;
    }
    
    // 복합 객체 직렬화 테스트 메서드
    public String testComplexObjectCaching() {
        System.out.println("=== 복합 객체 직렬화 테스트 시작 ===");
        
        try {
            // 실제 DTO 객체 생성
            List<ChatMessageResponseDto> testMessages = List.of(
                new ChatMessageResponseDto(
                    UUID.randomUUID(),
                    "Test message 1",
                    new ChatMessageResponseDto.UserInfoDto(UUID.randomUUID(), "Test User 1"),
                    UUID.randomUUID(),
                    LocalDateTime.now()
                ),
                new ChatMessageResponseDto(
                    UUID.randomUUID(),
                    "Test message 2", 
                    new ChatMessageResponseDto.UserInfoDto(UUID.randomUUID(), "Test User 2"),
                    UUID.randomUUID(),
                    LocalDateTime.now()
                )
            );
            
            System.out.println("=== 테스트 DTO 객체 생성 완료 ===");
            System.out.println("DTO 개수: " + testMessages.size());
            System.out.println("첫 번째 DTO: " + testMessages.get(0));
            
            // ManualCacheService를 사용하여 캐싱 시도 (비활성화)
            // String cacheKey = "complex-test:" + System.currentTimeMillis();
            // manualCacheService.put(cacheKey, testMessages);
            
            System.out.println("=== 복합 객체 캐싱 시도 완료 ===");
            return "복합 객체 캐싱 테스트 완료";
            
        } catch (Exception e) {
            System.err.println("=== 복합 객체 캐싱 실패 ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return "복합 객체 캐싱 실패: " + e.getMessage();
        }
    }

    // 수동 캐시를 사용한 메서드 - List 반환
    public List<ChatMessageResponseDto> getChatRoomMessagesList(UUID userId, UUID roomId,
                                                              UUID lastMessageId, int size) {
        String cacheKey = "chatMessages:" + roomId + "_" + lastMessageId + "_" + size;
        
        System.out.println("=== 수동 캐시 조회 시작 ===");
        System.out.println("Cache Key: " + cacheKey);
        
        // 캐시에서 데이터 조회 (비활성화)
        // Optional<List<ChatMessageResponseDto>> cachedData = manualCacheService.getList(cacheKey, ChatMessageResponseDto.class);
        // if (cachedData.isPresent()) {
        //     System.out.println("=== 캐시 히트 ===");
        //     System.out.println("캐시된 메시지 수: " + cachedData.get().size());
        //     return cachedData.get();
        // }
        
        System.out.println("=== 캐시 미스 - DB에서 조회 (캐시 비활성화) ===");
        System.out.println("roomId: " + roomId + ", lastMessageId: " + lastMessageId + ", size: " + size);
        
        // 사용자가 해당 채팅방에 참여하고 있는지 확인
        validateUserInChatRoom(userId, roomId);

        Pageable pageable = PageRequest.of(0, size);
        Page<ChatMessage> messages;

        if (lastMessageId != null) {
            // messageId를 sequence로 변환하여 커서 조회는 sequence 기준으로 수행
            ChatMessage last = chatMessageRepository.findById(lastMessageId)
                    .orElseThrow(() -> new CustomException("메시지를 찾을 수 없습니다.", ErrorCode.NOT_FOUND));
            messages = chatMessageRepository.findByChatRoomIdAndSequenceBeforeOrderBySequenceDesc(roomId, last.getSequence(), pageable);
        } else {
            messages = chatMessageRepository.findByChatRoomIdOrderBySentAtDesc(roomId, pageable);
        }

        List<ChatMessageResponseDto> result = messages.getContent().stream()
                .map(this::convertToMessageResponseDto)
                .collect(Collectors.toList());
        
        System.out.println("=== DB 조회 완료 ===");
        System.out.println("조회된 메시지 수: " + result.size());
        
        // 캐시에 저장 (비활성화)
        // try {
        //     manualCacheService.put(cacheKey, result);
        //     System.out.println("=== 캐시 저장 완료 ===");
        // } catch (Exception e) {
        //     System.err.println("=== 캐시 저장 실패 ===");
        //     System.err.println("Error: " + e.getMessage());
        //     e.printStackTrace();
        // }
        
        return result;
    }

    // 메시지 전송 (수동 캐시 무효화 적용)
    public ChatMessageResponseDto sendMessage(UUID userId, UUID roomId, ChatMessageRequestDto requestDto) {
        System.out.println("=== 메시지 전송 및 수동 캐시 무효화 ===");
        
        // 사용자가 해당 채팅방에 참여하고 있는지 확인
        validateUserInChatRoom(userId, roomId);

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));

        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("채팅방을 찾을 수 없습니다.", ErrorCode.CHAT_ROOM_NOT_FOUND));

        // 메시지 생성 및 저장
        long sequence = chatRoom.issueSequence();
        ChatMessage message = new ChatMessage(requestDto.getContent(), sender, chatRoom);
        message.setSequence(sequence);
        ChatMessage savedMessage = chatMessageRepository.save(message);

        // 수동 캐시 무효화 - 해당 채팅방의 모든 메시지 캐시 삭제 (비활성화)
        // try {
        //     String cachePattern = "chatMessages:" + roomId + "_*";
        //     manualCacheService.evictByPattern(cachePattern);
        //     System.out.println("=== 수동 캐시 무효화 완료 ===");
        //     System.out.println("Pattern: " + cachePattern);
        // } catch (Exception e) {
        //     System.err.println("=== 수동 캐시 무효화 실패 ===");
        //     System.err.println("Error: " + e.getMessage());
        //     e.printStackTrace();
        // }

        return convertToMessageResponseDto(savedMessage);
    }

    // 1:1 채팅방 생성
    public ChatRoomResponseDto createChatRoom(UUID creatorId, UUID participantId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));

        User participant = userRepository.findById(participantId)
                .orElseThrow(() -> new CustomException("참여자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));

        // 이미 존재하는 1:1 채팅방이 있는지 확인
        Optional<ChatRoom> existingRoom = findExistingOneToOneChatRoom(creatorId, participantId);
        if (existingRoom.isPresent()) {
            return convertToRoomResponseDto(existingRoom.get(), null, 0);
        }

        // 채팅방 이름 생성 (두 사용자의 닉네임으로)
        String roomName = creator.getNickname() + " & " + participant.getNickname();
        
        // 채팅방 생성
        ChatRoom chatRoom = new ChatRoom(roomName, creator, ChatRoom.ChatRoomType.ONE_TO_ONE);
        chatRoom.addParticipant(participant);

        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        return convertToRoomResponseDto(savedChatRoom, null, 0);
    }

    // 명함 기반 1:1 채팅방 생성
    public ChatRoomResponseDto createChatRoomByBusinessCard(UUID creatorId, String businessCardId) {
        System.out.println("=== ChatService.createChatRoomByBusinessCard 호출됨 ===");
        System.out.println("creatorId: " + creatorId);
        System.out.println("businessCardId: " + businessCardId);

        // 현재 사용자 조회
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));
        System.out.println("creator 조회 성공: " + creator.getNickname());

        // 명함 조회
        UUID businessCardUuid;
        try {
            businessCardUuid = UUID.fromString(businessCardId);
            System.out.println("UUID 파싱 성공: " + businessCardUuid);
        } catch (IllegalArgumentException e) {
            System.out.println("UUID 파싱 실패: " + e.getMessage());
            throw new CustomException("유효하지 않은 명함 ID입니다.", ErrorCode.INVALID_INPUT);
        }

        BusinessCard businessCard = businessCardRepository.findById(businessCardUuid)
                .orElseThrow(() -> {
                    System.out.println("명함을 찾을 수 없음: " + businessCardUuid);
                    return new CustomException("명함을 찾을 수 없습니다.", ErrorCode.BUSINESS_CARD_NOT_FOUND);
                });
        System.out.println("명함 조회 성공: " + businessCard.getName() + ", 소유자 ID: " + businessCard.getUserId());

        // 명함의 대상 사용자 ID로 실제 플랫폼 사용자 조회 (targetUserId가 있으면 사용, 없으면 userId 사용)
        UUID participantId = businessCard.getTargetUserId() != null ? businessCard.getTargetUserId() : businessCard.getUserId();
        User participant = userRepository.findById(participantId)
                .orElseThrow(() -> new CustomException("해당 명함의 사용자는 더 이상 플랫폼에 존재하지 않습니다.", ErrorCode.USER_NOT_FOUND));

        // 자기 자신과의 채팅방 생성 방지
        if (creatorId.equals(participant.getId())) {
            throw new CustomException("자기 자신과는 채팅방을 생성할 수 없습니다.", ErrorCode.INVALID_INPUT);
        }

        // 기존 채팅방이 있는지 확인하고, 있으면 반환
        Optional<ChatRoom> existingRoom = findExistingOneToOneChatRoom(creatorId, participant.getId());
        if (existingRoom.isPresent()) {
            return convertToRoomResponseDto(existingRoom.get(), null, 0);
        }

        // 새 채팅방 생성
        String roomName = creator.getNickname() + " & " + participant.getNickname();
        ChatRoom chatRoom = new ChatRoom(roomName, creator, ChatRoom.ChatRoomType.ONE_TO_ONE);
        chatRoom.addParticipant(participant);

        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        return convertToRoomResponseDto(savedChatRoom, null, 0);
    }

    // 그룹 채팅방 생성
    public ChatRoomResponseDto createGroupChatRoom(UUID creatorId, String roomName, List<UUID> participantIds) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));

        // 참여자들 조회
        List<User> participants = userRepository.findAllById(participantIds);
        if (participants.size() != participantIds.size()) {
            throw new CustomException("일부 사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND);
        }

        // 그룹 채팅방 생성
        ChatRoom chatRoom = new ChatRoom(roomName, creator, ChatRoom.ChatRoomType.GROUP);
        for (User participant : participants) {
            chatRoom.addParticipant(participant);
        }

        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        return convertToRoomResponseDto(savedChatRoom, null, 0);
    }

    // 사용자 초대
    public ChatRoomResponseDto inviteUsers(UUID inviterId, UUID roomId, List<UUID> userIds) {
        // 초대하는 사용자가 해당 채팅방에 참여하고 있는지 확인
        validateUserInChatRoom(inviterId, roomId);

        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("채팅방을 찾을 수 없습니다.", ErrorCode.CHAT_ROOM_NOT_FOUND));

        // 초대할 사용자들 조회
        List<User> usersToInvite = userRepository.findAllById(userIds);
        if (usersToInvite.size() != userIds.size()) {
            throw new CustomException("일부 사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND);
        }

        // 이미 참여하고 있는 사용자 제외
        List<User> newParticipants = usersToInvite.stream()
                .filter(user -> !chatRoom.getParticipants().contains(user))
                .collect(Collectors.toList());

        // 사용자들 초대
        for (User user : newParticipants) {
            chatRoom.addParticipant(user);
        }

        // 채팅방 저장
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        return convertToRoomResponseDto(savedChatRoom, null, 0);
    }

    // 기존 1:1 채팅방 찾기
    private Optional<ChatRoom> findExistingOneToOneChatRoom(UUID user1Id, UUID user2Id) {
        // 사용자1이 참여한 채팅방들 중에서 사용자2도 참여한 채팅방 찾기
        List<UUID> user1Rooms = chatRoomRepository.findChatRoomIdsByParticipantId(user1Id);
        List<UUID> user2Rooms = chatRoomRepository.findChatRoomIdsByParticipantId(user2Id);
        
        // 교집합 찾기
        List<UUID> commonRooms = user1Rooms.stream()
                .filter(user2Rooms::contains)
                .collect(Collectors.toList());
        
        // 1:1 채팅방만 필터링 (참여자가 2명인 채팅방)
        for (UUID roomId : commonRooms) {
            ChatRoom room = chatRoomRepository.findById(roomId).orElse(null);
            if (room != null && room.getParticipants().size() == 2) {
                return Optional.of(room);
            }
        }
        
        return Optional.empty();
    }

    // 사용자가 채팅방에 참여하고 있는지 확인
    private void validateUserInChatRoom(UUID userId, UUID roomId) {
        List<UUID> userChatRoomIds = chatRoomRepository.findChatRoomIdsByParticipantId(userId);
        if (!userChatRoomIds.contains(roomId)) {
            throw new CustomException("사용자가 해당 채팅방에 참여하지 않습니다.", ErrorCode.USER_NOT_IN_CHAT_ROOM);
        }
    }

    // ChatRoom을 ChatRoomResponseDto로 변환
    private ChatRoomResponseDto convertToRoomResponseDto(ChatRoom chatRoom, 
                                                        ChatMessageResponseDto lastMessage, 
                                                        long unreadCount) {
        List<ChatRoomResponseDto.UserInfoDto> participants = chatRoom.getParticipants().stream()
                .map(user -> new ChatRoomResponseDto.UserInfoDto(user.getId(), user.getNickname()))
                .collect(Collectors.toList());

        ChatRoomResponseDto.UserInfoDto creator = new ChatRoomResponseDto.UserInfoDto(
                chatRoom.getCreator().getId(), 
                chatRoom.getCreator().getNickname()
        );

        return new ChatRoomResponseDto(
                chatRoom.getId(),
                chatRoom.getName(),
                chatRoom.getType(),
                creator,
                chatRoom.getCreatedAt(),
                participants,
                lastMessage,
                unreadCount
        );
    }

    // ChatMessage를 ChatMessageResponseDto로 변환
    private ChatMessageResponseDto convertToMessageResponseDto(ChatMessage message) {
        ChatMessageResponseDto.UserInfoDto sender = new ChatMessageResponseDto.UserInfoDto(
                message.getSender().getId(),
                message.getSender().getNickname()
        );

        return new ChatMessageResponseDto(
                message.getId(),
                message.getContent(),
                sender,
                message.getChatRoom().getId(),
                message.getSentAt()
        );
    }

    // 사용자 내보내기
    public ChatRoomResponseDto removeUser(UUID removerId, UUID roomId, UUID userIdToRemove) {
        // 내보내는 사용자가 해당 채팅방에 참여하고 있는지 확인
        validateUserInChatRoom(removerId, roomId);

        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("채팅방을 찾을 수 없습니다.", ErrorCode.CHAT_ROOM_NOT_FOUND));

        // 방장만 사용자를 내보낼 수 있음
        if (!chatRoom.getCreator().getId().equals(removerId)) {
            throw new CustomException("방장만 사용자를 내보낼 수 있습니다.", ErrorCode.FORBIDDEN);
        }

        // 자신을 내보낼 수 없음
        if (removerId.equals(userIdToRemove)) {
            throw new CustomException("자신을 내보낼 수 없습니다.", ErrorCode.FORBIDDEN);
        }

        User userToRemove = userRepository.findById(userIdToRemove)
                .orElseThrow(() -> new CustomException("내보낼 사용자를 찾을 수 없습니다.", ErrorCode.USER_NOT_FOUND));

        // 사용자 제거
        chatRoom.removeParticipant(userToRemove);

        // 채팅방 저장
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        return convertToRoomResponseDto(savedChatRoom, null, 0);
    }

    // 채팅방 이름 변경
    public ChatRoomResponseDto updateRoomName(UUID updaterId, UUID roomId, String newName) {
        // 변경하는 사용자가 해당 채팅방에 참여하고 있는지 확인
        validateUserInChatRoom(updaterId, roomId);

        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("채팅방을 찾을 수 없습니다.", ErrorCode.CHAT_ROOM_NOT_FOUND));

        // 방장만 이름을 변경할 수 있음
        if (!chatRoom.getCreator().getId().equals(updaterId)) {
            throw new CustomException("방장만 채팅방 이름을 변경할 수 있습니다.", ErrorCode.FORBIDDEN);
        }

        // 이름 변경
        chatRoom.setName(newName);

        // 채팅방 저장
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        return convertToRoomResponseDto(savedChatRoom, null, 0);
    }
} 