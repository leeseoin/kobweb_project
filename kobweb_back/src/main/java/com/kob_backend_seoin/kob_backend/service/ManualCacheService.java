package com.kob_backend_seoin.kob_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

// @Service
public class ManualCacheService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // ObjectMapper는 현재 사용하지 않지만 향후 확장을 위해 유지
    // @Autowired
    // private ObjectMapper objectMapper;

    private static final String CACHE_PREFIX = "kob_cache:";
    private static final Duration DEFAULT_TTL = Duration.ofMinutes(10);
    
    
    /**
     * 캐시에서 데이터 조회 (간소화된 버전)
     */
    public <T> Optional<T> get(String key, Class<T> clazz) {
        try {
            String fullKey = CACHE_PREFIX + key;
            Object value = redisTemplate.opsForValue().get(fullKey);

            if (value != null) {
                System.out.println("=== CACHE HIT ===");
                System.out.println("Key: " + key);
                System.out.println("Value type: " + value.getClass().getName());
                return Optional.of(clazz.cast(value));
            } else {
                System.out.println("=== CACHE MISS ===");
                System.out.println("Key: " + key);
                return Optional.empty();
            }
        } catch (Exception e) {
            System.err.println("Cache get error: " + e.getMessage());
            e.printStackTrace();
            return Optional.empty();
        }
    }
    
    /**
     * 캐시에서 List 데이터 조회 (제네릭 타입 안전, 간소화)
     */
    @SuppressWarnings("unchecked")
    public <T> Optional<List<T>> getList(String key, Class<T> elementType) {
        try {
            String fullKey = CACHE_PREFIX + key;
            Object value = redisTemplate.opsForValue().get(fullKey);

            if (value != null) {
                System.out.println("=== CACHE HIT (List) ===");
                System.out.println("Key: " + key);
                System.out.println("Value type: " + value.getClass().getName());
                return Optional.of((List<T>) value);
            } else {
                System.out.println("=== CACHE MISS (List) ===");
                System.out.println("Key: " + key);
                return Optional.empty();
            }
        } catch (Exception e) {
            System.err.println("Cache get list error: " + e.getMessage());
            e.printStackTrace();
            return Optional.empty();
        }
    }
    
    /**
     * 캐시에 데이터 저장
     */
    public <T> void put(String key, T value) {
        put(key, value, DEFAULT_TTL);
    }
    
    /**
     * 캐시에 데이터 저장 (TTL 지정) - 트랜잭션 없이 실행
     */
    @org.springframework.transaction.annotation.Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public <T> void put(String key, T value, Duration ttl) {
        try {
            String fullKey = CACHE_PREFIX + key;

            System.out.println("=== CACHE PUT ===");
            System.out.println("Key: " + key);
            System.out.println("Full Key: " + fullKey);
            System.out.println("Value type: " + value.getClass().getName());
            System.out.println("TTL: " + ttl.toMinutes() + " minutes");

            // Redis 연결 테스트
            try {
                if (redisTemplate.getConnectionFactory() != null) {
                    String pingResult = redisTemplate.getConnectionFactory().getConnection().ping();
                    System.out.println("Redis connection test: " + pingResult);
                    
                    // 현재 데이터베이스 확인 (getDb() 메서드가 없으므로 제거)
                    System.out.println("Using database: 0 (default)");
                }
            } catch (Exception e) {
                System.err.println("Redis connection test failed: " + e.getMessage());
            }

            // 복합 객체 직렬화 시도
            System.out.println("=== 복합 객체 직렬화 시도 ===");
            System.out.println("Original value type: " + value.getClass().getName());
            System.out.println("Original value: " + value);
            
            // JSON으로 직렬화 시도
            String jsonValue;
            try {
                if (value instanceof String) {
                    jsonValue = (String) value;
                    System.out.println("=== String 값 직접 사용 ===");
                } else {
                    // ObjectMapper를 사용해서 JSON으로 직렬화
                    com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    jsonValue = objectMapper.writeValueAsString(value);
                    System.out.println("=== JSON 직렬화 성공 ===");
                }
                System.out.println("Serialized value: " + jsonValue);
                System.out.println("Serialized length: " + jsonValue.length());
            } catch (Exception e) {
                System.err.println("=== JSON 직렬화 실패, toString() 시도 ===");
                System.err.println("JSON serialization error: " + e.getMessage());
                e.printStackTrace();
                
                try {
                    jsonValue = value.toString();
                    System.out.println("=== toString() 성공 ===");
                    System.out.println("String value: " + jsonValue);
                } catch (Exception e2) {
                    System.err.println("=== toString()도 실패 ===");
                    System.err.println("toString() error: " + e2.getMessage());
                    e2.printStackTrace();
                    throw e2;
                }
            }
            
            // Redis 저장 시도
            System.out.println("=== Redis 저장 시도 ===");
            redisTemplate.opsForValue().set(fullKey, jsonValue, ttl);
            System.out.println("Redis 저장 완료");

            // 저장 후 즉시 확인
            System.out.println("=== 저장 후 확인 ===");
            Object storedValue = redisTemplate.opsForValue().get(fullKey);
            System.out.println("Stored value verification: " + (storedValue != null ? "SUCCESS" : "FAILED"));
            System.out.println("Stored value: " + storedValue);
            System.out.println("Stored value type: " + (storedValue != null ? storedValue.getClass().getName() : "NULL"));
            
            // Redis에서 직접 확인
            System.out.println("=== Redis 직접 확인 ===");
            try {
                byte[] directValueBytes = redisTemplate.getConnectionFactory().getConnection().get(fullKey.getBytes());
                String directValue = directValueBytes != null ? new String(directValueBytes) : null;
                System.out.println("Direct Redis value: " + directValue);
            } catch (Exception e) {
                System.err.println("Direct Redis check failed: " + e.getMessage());
            }

        } catch (Exception e) {
            System.err.println("Cache put error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 캐시에서 데이터 삭제
     */
    public void evict(String key) {
        try {
            String fullKey = CACHE_PREFIX + key;
            Boolean deleted = redisTemplate.delete(fullKey);
            
            System.out.println("=== CACHE EVICT ===");
            System.out.println("Key: " + key);
            System.out.println("Deleted: " + deleted);
        } catch (Exception e) {
            System.err.println("Cache evict error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 패턴으로 캐시 삭제 (SCAN 사용으로 성능 최적화)
     */
    public void evictByPattern(String pattern) {
        try {
            String fullPattern = CACHE_PREFIX + pattern;
            System.out.println("=== CACHE EVICT BY PATTERN ===");
            System.out.println("Pattern: " + fullPattern);
            
            // SCAN을 사용하여 키를 찾고 삭제
            List<String> keysToDelete = new ArrayList<>();
            try (Cursor<String> cursor = redisTemplate.scan(ScanOptions.scanOptions()
                    .match(fullPattern)
                    .count(100) // 한 번에 100개씩 스캔
                    .build())) {
                
                while (cursor.hasNext()) {
                    keysToDelete.add(cursor.next());
                }
            }
            
            if (!keysToDelete.isEmpty()) {
                redisTemplate.delete(keysToDelete);
                System.out.println("Evicted " + keysToDelete.size() + " keys.");
            } else {
                System.out.println("No keys found for pattern: " + fullPattern);
            }
        } catch (Exception e) {
            System.err.println("Cache evict by pattern error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 캐시 키 존재 여부 확인
     */
    public boolean exists(String key) {
        try {
            String fullKey = CACHE_PREFIX + key;
            return Boolean.TRUE.equals(redisTemplate.hasKey(fullKey));
        } catch (Exception e) {
            System.err.println("Cache exists error: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * 캐시 키 목록 조회 (SCAN 사용으로 성능 최적화)
     */
    public List<String> listCacheKeys() {
        try {
            String pattern = CACHE_PREFIX + "*";
            List<String> keys = new ArrayList<>();
            
            try (Cursor<String> cursor = redisTemplate.scan(ScanOptions.scanOptions()
                    .match(pattern)
                    .count(100) // 한 번에 100개씩 스캔
                    .build())) {
                
                while (cursor.hasNext()) {
                    keys.add(cursor.next());
                }
            }
            
            System.out.println("=== CACHE KEYS ===");
            if (!keys.isEmpty()) {
                keys.forEach(key -> System.out.println("Key: " + key));
            } else {
                System.out.println("No cache keys found");
            }
            
            return keys;
        } catch (Exception e) {
            System.err.println("List cache keys error: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * 캐시 통계 정보 조회
     */
    public void printCacheStats() {
        try {
            List<String> keys = listCacheKeys();
            System.out.println("=== CACHE STATS ===");
            System.out.println("Total keys: " + keys.size());
            System.out.println("Cache prefix: " + CACHE_PREFIX);
            
            // 키 타입별 통계
            keys.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    key -> key.split(":")[1], // 두 번째 부분을 타입으로 사용
                    java.util.stream.Collectors.counting()
                ))
                .forEach((type, count) -> 
                    System.out.println("Type " + type + ": " + count + " keys")
                );
                
        } catch (Exception e) {
            System.err.println("Cache stats error: " + e.getMessage());
        }
    }

    /**
     * 캐시 전체 초기화
     */
    public void clearAll() {
        try {
            String pattern = CACHE_PREFIX + "*";
            List<String> keysToDelete = new ArrayList<>();
            
            try (Cursor<String> cursor = redisTemplate.scan(ScanOptions.scanOptions()
                    .match(pattern)
                    .count(100)
                    .build())) {
                
                while (cursor.hasNext()) {
                    keysToDelete.add(cursor.next());
                }
            }
            
            if (!keysToDelete.isEmpty()) {
                redisTemplate.delete(keysToDelete);
                System.out.println("=== CACHE CLEARED ===");
                System.out.println("Deleted " + keysToDelete.size() + " keys.");
            } else {
                System.out.println("No cache keys to clear.");
            }
        } catch (Exception e) {
            System.err.println("Cache clear error: " + e.getMessage());
        }
    }
}
