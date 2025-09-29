package com.kob_backend_seoin.kob_backend.step4;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 4단계: 에러 처리 테스트 (중복 이메일, 잘못된 데이터)
 */
@SpringBootTest
@AutoConfigureMockMvc
public class ErrorHandlingTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testDuplicateEmailError() throws Exception {
        System.out.println("=== 4단계: 중복 이메일 에러 테스트 ===");

        long timestamp = System.currentTimeMillis();
        String email = "duplicate" + timestamp + "@example.com";

        String jsonRequest = String.format("""
            {
                "email": "%s",
                "password": "123456",
                "nickname": "첫번째유저"
            }
            """, email);

        // 첫 번째 유저 생성 (성공해야 함)
        System.out.println("🔄 첫 번째 유저 생성...");
        mockMvc.perform(post("/api/v1/users/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonRequest))
                .andExpect(status().isCreated())
                .andDo(result -> {
                    System.out.println("✅ 첫 번째 유저 생성 성공");
                });

        // 같은 이메일로 두 번째 유저 생성 시도 (실패해야 함)
        System.out.println("🔄 중복 이메일로 두 번째 유저 생성 시도...");
        String duplicateRequest = String.format("""
            {
                "email": "%s",
                "password": "123456",
                "nickname": "중복유저"
            }
            """, email);

        mockMvc.perform(post("/api/v1/users/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(duplicateRequest))
                .andExpect(status().isConflict()) // 409 Conflict 기대
                .andDo(result -> {
                    System.out.println("✅ 중복 이메일 에러 처리 성공");
                    System.out.println("응답: " + result.getResponse().getContentAsString());
                });

        System.out.println("=== 중복 이메일 에러 테스트 완료 ===");
    }

    @Test
    public void testInvalidDataError() throws Exception {
        System.out.println("=== 잘못된 데이터 에러 테스트 ===");

        // 빈 이메일 테스트
        String invalidRequest = """
            {
                "email": "",
                "password": "123456",
                "nickname": "잘못된유저"
            }
            """;

        System.out.println("🔄 빈 이메일로 유저 생성 시도...");
        mockMvc.perform(post("/api/v1/users/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest))
                .andExpect(status().isBadRequest()) // 400 Bad Request 기대
                .andDo(result -> {
                    System.out.println("✅ 잘못된 데이터 에러 처리 성공");
                    System.out.println("응답: " + result.getResponse().getContentAsString());
                });

        System.out.println("=== 잘못된 데이터 에러 테스트 완료 ===");
    }
}