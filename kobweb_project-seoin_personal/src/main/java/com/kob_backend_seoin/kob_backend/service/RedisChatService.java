package com.kob_backend_seoin.kob_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Redis를 활용한 채팅 부가기능 서비스
 * - 온라인 사용자 관리
 * - 안 읽은 메시지 카운트
 * - 채팅방 접속자 관리
 * - 최근 활동 추적
 */
@Service
public class RedisChatService {

    private final RedisTemplate<String, Object> redisTemplate;

    // Redis Key 패턴
    private static final String ONLINE_USERS_KEY = "chat:online:users";
    private static final String ROOM_PARTICIPANTS_KEY = "chat:room:%s:participants";
    private static final String UNREAD_COUNT_KEY = "chat:unread:%s:%s"; // userId:roomId
    private static final String USER_LAST_SEEN_KEY = "chat:lastseen:%s"; // userId
    private static final String ROOM_LAST_MESSAGE_KEY = "chat:room:%s:lastmsg";

    @Autowired
    public RedisChatService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * 사용자 온라인 상태 관리
     */
    public void setUserOnline(UUID userId) {
        String key = ONLINE_USERS_KEY;
        redisTemplate.opsForSet().add(key, userId.toString());
        redisTemplate.expire(key, 30, TimeUnit.MINUTES); // 30분 후 자동 만료

        // 마지막 접속 시간 업데이트
        setUserLastSeen(userId);
    }

    public void setUserOffline(UUID userId) {
        redisTemplate.opsForSet().remove(ONLINE_USERS_KEY, userId.toString());
    }

    public boolean isUserOnline(UUID userId) {
        return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(ONLINE_USERS_KEY, userId.toString()));
    }

    public Set<Object> getOnlineUsers() {
        return redisTemplate.opsForSet().members(ONLINE_USERS_KEY);
    }

    /**
     * 채팅방 참여자 관리
     */
    public void addUserToRoom(UUID userId, UUID roomId) {
        String key = String.format(ROOM_PARTICIPANTS_KEY, roomId.toString());
        redisTemplate.opsForSet().add(key, userId.toString());
        redisTemplate.expire(key, 24, TimeUnit.HOURS); // 24시간 후 자동 만료
    }

    public void removeUserFromRoom(UUID userId, UUID roomId) {
        String key = String.format(ROOM_PARTICIPANTS_KEY, roomId.toString());
        redisTemplate.opsForSet().remove(key, userId.toString());
    }

    public Set<Object> getRoomParticipants(UUID roomId) {
        String key = String.format(ROOM_PARTICIPANTS_KEY, roomId.toString());
        return redisTemplate.opsForSet().members(key);
    }

    public Long getRoomParticipantCount(UUID roomId) {
        String key = String.format(ROOM_PARTICIPANTS_KEY, roomId.toString());
        return redisTemplate.opsForSet().size(key);
    }

    /**
     * 안 읽은 메시지 카운트 관리
     */
    public void incrementUnreadCount(UUID userId, UUID roomId) {
        String key = String.format(UNREAD_COUNT_KEY, userId.toString(), roomId.toString());
        redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, 30, TimeUnit.DAYS); // 30일 후 자동 만료
    }

    public void resetUnreadCount(UUID userId, UUID roomId) {
        String key = String.format(UNREAD_COUNT_KEY, userId.toString(), roomId.toString());
        redisTemplate.delete(key);
    }

    public Long getUnreadCount(UUID userId, UUID roomId) {
        String key = String.format(UNREAD_COUNT_KEY, userId.toString(), roomId.toString());
        Object count = redisTemplate.opsForValue().get(key);
        return count != null ? Long.parseLong(count.toString()) : 0L;
    }

    /**
     * 사용자 마지막 접속 시간 관리
     */
    public void setUserLastSeen(UUID userId) {
        String key = String.format(USER_LAST_SEEN_KEY, userId.toString());
        redisTemplate.opsForValue().set(key, System.currentTimeMillis());
        redisTemplate.expire(key, 30, TimeUnit.DAYS); // 30일 후 자동 만료
    }

    public Long getUserLastSeen(UUID userId) {
        String key = String.format(USER_LAST_SEEN_KEY, userId.toString());
        Object lastSeen = redisTemplate.opsForValue().get(key);
        return lastSeen != null ? Long.parseLong(lastSeen.toString()) : null;
    }

    /**
     * 채팅방 마지막 메시지 정보 관리
     */
    public void setRoomLastMessage(UUID roomId, String messageContent, UUID senderId, long timestamp) {
        String key = String.format(ROOM_LAST_MESSAGE_KEY, roomId.toString());
        String value = String.format("%s|%s|%d", messageContent, senderId.toString(), timestamp);
        redisTemplate.opsForValue().set(key, value);
        redisTemplate.expire(key, 30, TimeUnit.DAYS); // 30일 후 자동 만료
    }

    public String getRoomLastMessage(UUID roomId) {
        String key = String.format(ROOM_LAST_MESSAGE_KEY, roomId.toString());
        Object message = redisTemplate.opsForValue().get(key);
        return message != null ? message.toString() : null;
    }

    /**
     * 사용자별 채팅방 목록 및 정보 캐싱
     */
    public void cacheUserChatRooms(UUID userId, Object chatRoomsData) {
        String key = "chat:user:" + userId.toString() + ":rooms";
        redisTemplate.opsForValue().set(key, chatRoomsData);
        redisTemplate.expire(key, 10, TimeUnit.MINUTES); // 10분 캐싱
    }

    public Object getCachedUserChatRooms(UUID userId) {
        String key = "chat:user:" + userId.toString() + ":rooms";
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * 시스템 전체 채팅 통계
     */
    public void updateChatStatistics() {
        Long onlineUserCount = redisTemplate.opsForSet().size(ONLINE_USERS_KEY);
        redisTemplate.opsForValue().set("chat:stats:online", onlineUserCount != null ? onlineUserCount : 0);
        redisTemplate.opsForValue().set("chat:stats:timestamp", System.currentTimeMillis());
    }

    public Long getOnlineUserCount() {
        Object count = redisTemplate.opsForValue().get("chat:stats:online");
        return count != null ? Long.parseLong(count.toString()) : 0L;
    }
}