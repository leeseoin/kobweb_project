package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.dto.Chat.ChatMessageResponseDto;
import com.kob_backend_seoin.kob_backend.dto.Chat.ChatRoomResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

// @Service
public class HashCacheService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private CacheManager cacheManager;
    
    // 사용자 채팅방 목록 캐싱
    public void cacheUserChatRooms(UUID userId, List<ChatRoomResponseDto> chatRooms) {
        String bucketKey = "userbucket:" + (userId.hashCode() % 1000);
        String fieldKey = "chatrooms";
        
        System.out.println("=== HashCacheService.cacheUserChatRooms 호출됨 ===");
        System.out.println("userId: " + userId);
        System.out.println("bucketKey: " + bucketKey);
        System.out.println("chatRooms size: " + chatRooms.size());
        
        try {
            // 1. Redis 연결 테스트
            redisTemplate.opsForValue().set("test:connection", "success");
            String testResult = (String) redisTemplate.opsForValue().get("test:connection");
            System.out.println("Redis 연결 테스트: " + testResult);
            
            // 2. 간단한 데이터 저장 테스트
            redisTemplate.opsForValue().set("test:simple", "hello");
            String simpleResult = (String) redisTemplate.opsForValue().get("test:simple");
            System.out.println("Redis 간단 저장 테스트: " + simpleResult);
            
            // 3. Hash 저장 테스트
            redisTemplate.opsForHash().put("test:hash", "field1", "value1");
            Object hashResult = redisTemplate.opsForHash().get("test:hash", "field1");
            System.out.println("Redis Hash 저장 테스트: " + hashResult);
            
            // 4. 실제 데이터 저장
            redisTemplate.opsForHash().put(bucketKey, fieldKey, chatRooms);
            redisTemplate.expire(bucketKey, Duration.ofMinutes(5));
            
            // 5. 저장 확인
            Object saved = redisTemplate.opsForHash().get(bucketKey, fieldKey);
            System.out.println("Redis 실제 데이터 저장 확인: " + (saved != null ? "성공" : "실패"));
            
            System.out.println("Redis 캐시 저장 완료: " + bucketKey);
        } catch (Exception e) {
            System.err.println("Redis 저장 오류: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // 사용자 채팅방 목록 조회
    @SuppressWarnings("unchecked")
    public List<ChatRoomResponseDto> getUserChatRooms(UUID userId) {
        String bucketKey = "userbucket:" + (userId.hashCode() % 1000);
        String fieldKey = "chatrooms";
        
        System.out.println("=== HashCacheService.getUserChatRooms 호출됨 ===");
        System.out.println("userId: " + userId);
        System.out.println("bucketKey: " + bucketKey);
        
        try {
            // Redis 연결 상태 확인
            System.out.println("Redis 연결 테스트 시작...");
            redisTemplate.opsForValue().set("debug:test", "connection_ok");
            String testResult = (String) redisTemplate.opsForValue().get("debug:test");
            System.out.println("Redis 연결 테스트 결과: " + testResult);
            
            // 캐시 조회
            System.out.println("캐시 조회 시작...");
            Object cached = redisTemplate.opsForHash().get(bucketKey, fieldKey);
            System.out.println("캐시 조회 완료, 결과: " + (cached != null ? "데이터 있음" : "데이터 없음"));
            
            if (cached != null) {
                System.out.println("Redis 캐시 히트: " + bucketKey);
                System.out.println("캐시된 데이터 타입: " + cached.getClass().getName());
            } else {
                System.out.println("Redis 캐시 미스: " + bucketKey);
            }
            
            return (List<ChatRoomResponseDto>) cached;
        } catch (Exception e) {
            System.err.println("Redis 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    // 채팅방 메시지 캐싱
    public void cacheChatRoomMessages(UUID roomId, List<ChatMessageResponseDto> messages) {
        String bucketKey = "roombucket:" + (roomId.hashCode() % 1000);
        String fieldKey = "messages:" + roomId;
        
        System.out.println("=== HashCacheService.cacheChatRoomMessages 호출됨 ===");
        System.out.println("roomId: " + roomId);
        System.out.println("bucketKey: " + bucketKey);
        System.out.println("messages size: " + messages.size());
        
        try {
            redisTemplate.opsForHash().put(bucketKey, fieldKey, messages);
            redisTemplate.expire(bucketKey, Duration.ofMinutes(10));
            System.out.println("Redis 메시지 캐시 저장 완료: " + bucketKey);
        } catch (Exception e) {
            System.err.println("Redis 메시지 저장 오류: " + e.getMessage());
        }
    }
    
    // 채팅방 메시지 조회
    @SuppressWarnings("unchecked")
    public List<ChatMessageResponseDto> getChatRoomMessages(UUID roomId) {
        String bucketKey = "roombucket:" + (roomId.hashCode() % 1000);
        String fieldKey = "messages:" + roomId;
        
        System.out.println("=== HashCacheService.getChatRoomMessages 호출됨 ===");
        System.out.println("roomId: " + roomId);
        System.out.println("bucketKey: " + bucketKey);
        
        try {
            // Spring Cache Manager 테스트
            testSpringCacheManager();
            
            // Redis 연결 상태 확인
            System.out.println("Redis 연결 테스트 시작...");
            redisTemplate.opsForValue().set("debug:test2", "connection_ok");
            String testResult = (String) redisTemplate.opsForValue().get("debug:test2");
            System.out.println("Redis 연결 테스트 결과: " + testResult);
            
            // 캐시 조회
            System.out.println("캐시 조회 시작...");
            Object cached = redisTemplate.opsForHash().get(bucketKey, fieldKey);
            System.out.println("캐시 조회 완료, 결과: " + (cached != null ? "데이터 있음" : "데이터 없음"));
            
            if (cached != null) {
                System.out.println("Redis 메시지 캐시 히트: " + bucketKey);
                System.out.println("캐시된 데이터 타입: " + cached.getClass().getName());
            } else {
                System.out.println("Redis 메시지 캐시 미스: " + bucketKey);
            }
            
            return (List<ChatMessageResponseDto>) cached;
        } catch (Exception e) {
            System.err.println("Redis 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    // 채팅방 캐시 무효화 (새 메시지 전송 시)
    public void invalidateRoomCache(UUID roomId) {
        String bucketKey = "roombucket:" + (roomId.hashCode() % 1000);
        redisTemplate.delete(bucketKey);
        System.out.println("Redis 채팅방 캐시 무효화: " + bucketKey);
    }
    
    // 사용자 캐시 무효화
    public void invalidateUserCache(UUID userId) {
        String bucketKey = "userbucket:" + (userId.hashCode() % 1000);
        redisTemplate.delete(bucketKey);
        System.out.println("Redis 사용자 캐시 무효화: " + bucketKey);
    }
    
    // Spring Cache Manager 테스트
    public void testSpringCacheManager() {
        System.out.println("=== Spring Cache Manager 테스트 시작 ===");
        
        try {
            // CacheManager 정보 출력
            System.out.println("CacheManager 타입: " + cacheManager.getClass().getName());
            System.out.println("CacheManager 구현체: " + cacheManager);
            
            // 기본 캐시 이름들 확인
            System.out.println("사용 가능한 캐시 이름들: " + cacheManager.getCacheNames());
            
            // 테스트 캐시 생성 및 사용
            var testCache = cacheManager.getCache("testCache");
            if (testCache != null) {
                testCache.put("testKey", "testValue");
                String cachedValue = testCache.get("testKey", String.class);
                System.out.println("Spring Cache Manager 테스트 결과: " + cachedValue);
            } else {
                System.out.println("testCache를 찾을 수 없습니다.");
            }
            
        } catch (Exception e) {
            System.err.println("Spring Cache Manager 테스트 오류: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("=== Spring Cache Manager 테스트 완료 ===");
    }
}
