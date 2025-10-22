package com.kob_backend_seoin.kob_backend.step1;

import com.kob_backend_seoin.kob_backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

/**
 * 1단계: 기본 테스트 설정 및 의존성 주입 확인
 */
@SpringBootTest
@AutoConfigureMockMvc
public class BasicTestSetup {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void contextLoads() {
        System.out.println("=== 1단계: 컨텍스트 로딩 테스트 ===");
        System.out.println("UserRepository: " + (userRepository != null ? "성공" : "실패"));
        System.out.println("MockMvc: " + (mockMvc != null ? "성공" : "실패"));
        System.out.println("=== 컨텍스트 로딩 완료 ===");
    }

    @Test
    public void checkDatabaseConnection() {
        System.out.println("=== 데이터베이스 연결 확인 ===");
        long userCount = userRepository.count();
        System.out.println("현재 유저 수: " + userCount);
        System.out.println("데이터베이스 연결: 성공");
    }
}