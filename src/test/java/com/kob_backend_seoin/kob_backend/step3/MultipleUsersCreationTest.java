package com.kob_backend_seoin.kob_backend.step3;

import com.kob_backend_seoin.kob_backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 3단계: 다중 유저(30명) 생성 테스트
 */
@SpringBootTest
@AutoConfigureMockMvc
public class MultipleUsersCreationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void createThirtyUsers() throws Exception {
        System.out.println("=== 30명 유저 생성 테스트 ===");

        // 현재 유저 수 확인
        long initialCount = userRepository.count();
        System.out.println("🔍 시작 전 유저 수: " + initialCount);

        // 30명의 유저 생성
        for (int i = 1; i <= 30; i++) {
            final int userNumber = i;
            String nickname = "이서인" + i;
            String email = "leeseoin" + i + "@test.com";
            String password = "12345678";

            System.out.println("🔄 " + nickname + " 생성 시작...");

            String jsonRequest = String.format("""
                {
                    "email": "%s",
                    "password": "%s",
                    "nickname": "%s"
                }
                """, email, password, nickname);

            mockMvc.perform(post("/api/v1/users/signup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonRequest))
                    .andExpect(status().isCreated())
                    .andDo(result -> {
                        System.out.println("✅ " + userNumber + ". " + nickname + " 생성 완료");
                        System.out.println("응답: " + result.getResponse().getContentAsString());
                    });
        }

        // 최종 유저 수 확인
        long finalCount = userRepository.count();
        System.out.println("🔍 생성 후 유저 수: " + finalCount);
        System.out.println("📊 실제 생성된 유저 수: " + (finalCount - initialCount));

        System.out.println("=== 30명 유저 생성 테스트 완료 ===");
    }
}