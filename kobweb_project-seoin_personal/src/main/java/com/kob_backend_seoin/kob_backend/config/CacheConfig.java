package com.kob_backend_seoin.kob_backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cache.CacheManager;
// import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

// @Configuration
// @EnableCaching
public class CacheConfig {
    
    static {
        System.out.println("=== CacheConfig 클래스 로드됨 ===");
    }

    @Bean("redisConnectionFactory")
    @ConditionalOnMissingBean(RedisConnectionFactory.class)
    public RedisConnectionFactory redisConnectionFactory() {
        // 최신 방식: RedisStandaloneConfiguration 사용
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName("localhost");
        config.setPort(6379);
        config.setDatabase(0);
        
        LettuceConnectionFactory factory = new LettuceConnectionFactory(config);
        factory.setValidateConnection(true);
        factory.setShareNativeConnection(false);
        return factory;
    }

    @Bean("cacheManager")
    @Primary
    @ConditionalOnMissingBean(CacheManager.class)
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory, ObjectMapper objectMapper) {
        System.out.println("=== RedisCacheManager 생성 중 ===");
        System.out.println("ConnectionFactory: " + connectionFactory.getClass().getSimpleName());
        
        // JacksonConfig에서 정의된 ObjectMapper 빈을 주입받아 사용
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);
        
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(jsonSerializer))
                .prefixCacheNameWith("kob_cache:") // 명시적으로 접두사 설정
                .disableCachingNullValues(); // null 값 캐싱 비활성화
        
        // Redis 캐시 매니저 생성 (우선순위 설정)
        RedisCacheManager cacheManager = RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .build();
                
        System.out.println("=== RedisCacheManager 생성 완료 ===");
        System.out.println("Cache prefix: kob_cache:");
        System.out.println("Key serializer: StringRedisSerializer");
        System.out.println("Value serializer: GenericJackson2JsonRedisSerializer");
        
        return cacheManager;
    }
}