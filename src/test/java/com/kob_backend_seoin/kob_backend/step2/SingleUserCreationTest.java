package com.kob_backend_seoin.kob_backend.step2;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 2단계: 단일 유저 생성 테스트
 */
@SpringBootTest
@AutoConfigureMockMvc
public class SingleUserCreationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void createSingleUser() throws Exception {
        System.out.println("=== 2단계: 단일 유저 생성 테스트 ===");

        // 타임스탬프를 이용한 유니크 이메일
        long timestamp = System.currentTimeMillis();
        String email = "test" + timestamp + "@example.com";

        String jsonRequest = String.format("""
            {
                "email": "%s",
                "password": "123456",
                "nickname": "테스트유저"
            }
            """, email);

        System.out.println("🔄 단일 유저 생성 요청 시작...");
        System.out.println("이메일: " + email);

        mockMvc.perform(post("/api/v1/users/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonRequest))
                .andExpect(status().isCreated())
                .andDo(result -> {
                    System.out.println("✅ API 응답: " + result.getResponse().getContentAsString());
                });

        System.out.println("✅ 단일 유저 생성 성공!");
        System.out.println("=== 단일 유저 생성 테스트 완료 ===");
    }
}