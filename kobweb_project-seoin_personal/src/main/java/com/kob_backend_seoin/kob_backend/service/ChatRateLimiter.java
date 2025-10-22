package com.kob_backend_seoin.kob_backend.service;

import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

@Component
public class ChatRateLimiter {

    private static final Logger log = Logger.getLogger(ChatRateLimiter.class.getName());

    // 간단한 Rate Limiter 구현을 위한 내부 클래스
    private static class SimpleRateLimiter {
        private final double permitsPerSecond;
        private volatile long lastPermitTime;
        private volatile double availablePermits;

        public SimpleRateLimiter(double permitsPerSecond) {
            this.permitsPerSecond = permitsPerSecond;
            this.availablePermits = permitsPerSecond;
            this.lastPermitTime = System.currentTimeMillis();
        }

        public synchronized boolean tryAcquire() {
            long currentTime = System.currentTimeMillis();
            double timeDiff = (currentTime - lastPermitTime) / 1000.0;

            // 시간이 지나면서 누적된 허용량 추가
            availablePermits = Math.min(permitsPerSecond, availablePermits + timeDiff * permitsPerSecond);
            lastPermitTime = currentTime;

            if (availablePermits >= 1.0) {
                availablePermits -= 1.0;
                return true;
            }
            return false;
        }
    }

    // 사용자별 Rate Limiter 저장
    private final ConcurrentHashMap<UUID, SimpleRateLimiter> userLimiters = new ConcurrentHashMap<>();

    // 정리 작업을 위한 스케줄러
    private final ScheduledExecutorService cleanupScheduler = Executors.newSingleThreadScheduledExecutor();

    // 설정값들
    private static final double MESSAGES_PER_SECOND = 10.0; // 초당 10개 메시지
    private static final long CLEANUP_INTERVAL_MINUTES = 30; // 30분마다 정리
    private static final long LIMITER_EXPIRE_MINUTES = 60; // 1시간 사용하지 않으면 제거

    // 마지막 사용 시간 추적
    private final ConcurrentHashMap<UUID, Long> lastUsedTime = new ConcurrentHashMap<>();

    public ChatRateLimiter() {
        // 주기적으로 사용하지 않는 Rate Limiter 정리
        cleanupScheduler.scheduleAtFixedRate(
                this::cleanupUnusedLimiters,
                CLEANUP_INTERVAL_MINUTES,
                CLEANUP_INTERVAL_MINUTES,
                TimeUnit.MINUTES
        );
    }

    /**
     * 사용자가 메시지를 전송할 수 있는지 확인
     */
    public boolean allowMessage(UUID userId) {
        if (userId == null) {
            return false;
        }

        SimpleRateLimiter limiter = userLimiters.computeIfAbsent(userId,
            k -> {
                log.info("새로운 Rate Limiter 생성: 사용자 " + userId);
                return new SimpleRateLimiter(MESSAGES_PER_SECOND);
            });

        // 마지막 사용 시간 업데이트
        lastUsedTime.put(userId, System.currentTimeMillis());

        boolean allowed = limiter.tryAcquire();

        if (!allowed) {
            log.warning("Rate Limit 초과: 사용자 " + userId + " (초당 " + MESSAGES_PER_SECOND + "개 제한)");
        }

        return allowed;
    }

    /**
     * 특정 사용자의 Rate Limit 정보 조회
     */
    public double getAvailablePermits(UUID userId) {
        SimpleRateLimiter limiter = userLimiters.get(userId);
        return limiter != null ? limiter.availablePermits : 0.0;
    }

    /**
     * 사용자의 Rate Limiter 초기화 (관리자 기능)
     */
    public void resetUserLimit(UUID userId) {
        userLimiters.remove(userId);
        lastUsedTime.remove(userId);
        log.info("사용자 " + userId + "의 Rate Limit 초기화");
    }

    /**
     * 모든 Rate Limiter 초기화 (관리자 기능)
     */
    public void resetAllLimits() {
        int removedCount = userLimiters.size();
        userLimiters.clear();
        lastUsedTime.clear();
        log.info("모든 Rate Limiter 초기화: " + removedCount + "개 제거");
    }

    /**
     * 현재 활성 사용자 수 조회
     */
    public int getActiveLimitersCount() {
        return userLimiters.size();
    }

    /**
     * 사용하지 않는 Rate Limiter 정리
     */
    private void cleanupUnusedLimiters() {
        long currentTime = System.currentTimeMillis();
        long expireThreshold = LIMITER_EXPIRE_MINUTES * 60 * 1000; // 분을 밀리초로 변환

        int removedCount = 0;

        // 만료된 항목들 찾기
        for (var entry : lastUsedTime.entrySet()) {
            UUID userId = entry.getKey();
            long lastUsed = entry.getValue();

            if (currentTime - lastUsed > expireThreshold) {
                userLimiters.remove(userId);
                lastUsedTime.remove(userId);
                removedCount++;
            }
        }

        if (removedCount > 0) {
            log.info("사용하지 않는 Rate Limiter " + removedCount + "개 정리 완료");
        }
    }

    /**
     * Rate Limiter 설정 정보 조회
     */
    public RateLimiterInfo getLimiterInfo() {
        return new RateLimiterInfo(
                MESSAGES_PER_SECOND,
                getActiveLimitersCount(),
                LIMITER_EXPIRE_MINUTES
        );
    }

    /**
     * Rate Limiter 정보를 담는 DTO
     */
    public static class RateLimiterInfo {
        private final double messagesPerSecond;
        private final int activeLimiters;
        private final long expireMinutes;

        public RateLimiterInfo(double messagesPerSecond, int activeLimiters, long expireMinutes) {
            this.messagesPerSecond = messagesPerSecond;
            this.activeLimiters = activeLimiters;
            this.expireMinutes = expireMinutes;
        }

        public double getMessagesPerSecond() { return messagesPerSecond; }
        public int getActiveLimiters() { return activeLimiters; }
        public long getExpireMinutes() { return expireMinutes; }
    }

    /**
     * 애플리케이션 종료 시 스케줄러 정리
     */
    public void shutdown() {
        cleanupScheduler.shutdown();
        try {
            if (!cleanupScheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                cleanupScheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            cleanupScheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}