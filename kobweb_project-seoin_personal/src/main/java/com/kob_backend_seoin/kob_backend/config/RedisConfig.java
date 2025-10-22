
package com.kob_backend_seoin.kob_backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import java.time.Duration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {
    
    static {
        System.out.println("=== RedisConfig 클래스 로드됨 ===");
    }

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        // Redis 스탠드얼론 설정 (최신 방식)
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
        redisConfig.setHostName("localhost");
        redisConfig.setPort(6379);
        redisConfig.setDatabase(0); // 이 방법은 deprecated 아님
        // redisConfig.setPassword("password"); // 필요시 설정

        // Lettuce 클라이언트 설정 (최신 방식)
        LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
                .commandTimeout(Duration.ofMillis(2000)) // setTimeout 대체
                .shutdownTimeout(Duration.ofMillis(100))
                .build();

        // LettuceConnectionFactory 생성 (최신 방식)
        LettuceConnectionFactory factory = new LettuceConnectionFactory(redisConfig, clientConfig);

        // 연결 설정
        factory.setValidateConnection(true);
        factory.setShareNativeConnection(false);

        System.out.println("=== RedisConnectionFactory 생성됨 (최신 방식) ===");
        System.out.println("Host: " + redisConfig.getHostName());
        System.out.println("Port: " + redisConfig.getPort());
        System.out.println("Database: " + redisConfig.getDatabase());
        System.out.println("Command Timeout: " + clientConfig.getCommandTimeout());
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

    /**
     * Redis Pub/Sub 리스너 컨테이너 설정 - 채팅 메시지 브로드캐스팅용
     */
    @Bean
    public org.springframework.data.redis.listener.RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory) {
        org.springframework.data.redis.listener.RedisMessageListenerContainer container =
                new org.springframework.data.redis.listener.RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);

        System.out.println("=== RedisMessageListenerContainer 생성됨 ===");
        return container;
    }

    /**
     * 채팅 메시지 발행용 RedisTemplate (String 기반)
     */
    @Bean("chatRedisTemplate")
    public RedisTemplate<String, String> chatRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // 모든 직렬화를 String으로 설정 (Pub/Sub 메시지용)
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setDefaultSerializer(stringSerializer);
        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);

        template.afterPropertiesSet();

        System.out.println("=== Chat RedisTemplate 생성됨 ===");
        return template;
    }

}
