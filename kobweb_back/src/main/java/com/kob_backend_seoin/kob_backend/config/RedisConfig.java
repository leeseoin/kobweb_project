
package com.kob_backend_seoin.kob_backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

// @Configuration
public class RedisConfig {
    
    static {
        System.out.println("=== RedisConfig 클래스 로드됨 ===");
    }

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        // Redis 연결 설정을 더 명확하게 구성
        LettuceConnectionFactory factory = new LettuceConnectionFactory("localhost", 6379);
        factory.setDatabase(0);
        factory.setTimeout(2000);
        
        // 연결 풀 설정 강화
        factory.setValidateConnection(true);
        factory.setShareNativeConnection(false);
        
        // 추가 연결 풀 설정
        factory.setValidateConnection(true);
        factory.setShareNativeConnection(false);
        
        System.out.println("=== RedisConnectionFactory 생성됨 ===");
        System.out.println("Host: " + factory.getHostName());
        System.out.println("Port: " + factory.getPort());
        System.out.println("Database: " + factory.getDatabase());
        System.out.println("Timeout: " + factory.getTimeout());
        System.out.println("ValidateConnection: " + factory.getValidateConnection());
        System.out.println("ShareNativeConnection: " + factory.getShareNativeConnection());
        
        return factory;
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory, ObjectMapper objectMapper) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // 직렬화 설정 - String 직렬화로 테스트
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        
        // 키와 값의 직렬화 설정 (모두 String으로)
        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);
        
        // 중요: 모든 설정이 끝난 후 초기화
        template.afterPropertiesSet();
        
        System.out.println("=== RedisTemplate 생성됨 ===");
        System.out.println("ConnectionFactory: " + connectionFactory.getClass().getSimpleName());
        System.out.println("Key Serializer: " + template.getKeySerializer().getClass().getSimpleName());
        System.out.println("Value Serializer: " + template.getValueSerializer().getClass().getSimpleName());
        
        // RedisTemplate 테스트
        try {
            System.out.println("=== RedisTemplate 연결 테스트 ===");
            String pingResult = template.getConnectionFactory().getConnection().ping();
            System.out.println("Redis ping: " + pingResult);
            
            // 현재 데이터베이스 확인 (getDb() 메서드가 없으므로 제거)
            System.out.println("Using database: 0 (default)");
            
            // 테스트 데이터 저장
            template.opsForValue().set("test-key", "test-value");
            String testValue = (String) template.opsForValue().get("test-key");
            System.out.println("Test value stored and retrieved: " + testValue);
            
            // 저장 후 즉시 데이터베이스 0에서 확인
            System.out.println("=== 저장 후 데이터베이스 0 확인 ===");
            try {
                var keys = template.keys("*");
                if (keys != null && !keys.isEmpty()) {
                    System.out.println("Database 0 has keys: " + keys);
                } else {
                    System.out.println("Database 0 is empty");
                }
            } catch (Exception e) {
                System.err.println("Database 0 check failed: " + e.getMessage());
            }
            
        } catch (Exception e) {
            System.err.println("RedisTemplate 테스트 실패: " + e.getMessage());
            e.printStackTrace();
        }
        
        return template;
    }
    
}
