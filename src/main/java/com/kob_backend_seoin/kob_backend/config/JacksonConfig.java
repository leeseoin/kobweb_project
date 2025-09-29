package com.kob_backend_seoin.kob_backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {
    
    static {
        System.out.println("=== JacksonConfig 클래스 로드됨 ===");
    }
    
    @Bean
    public ObjectMapper objectMapper() {
        System.out.println("=== ObjectMapper 빈 생성 중 ===");
        
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);
        
        // 직렬화 문제 해결을 위한 추가 설정
        mapper.configure(com.fasterxml.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, false);
        
        System.out.println("=== ObjectMapper 빈 생성 완료 ===");
        return mapper;
    }
}
