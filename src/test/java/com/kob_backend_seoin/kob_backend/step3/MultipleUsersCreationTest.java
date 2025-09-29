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
 * 3단계: 다중 유저(3명) 생성 테스트
 */
@SpringBootTest
@AutoConfigureMockMvc
public class MultipleUsersCreationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void createThreeUsers() throws Exception {
        System.out.println("=== 3단계: 3명 유저 생성 테스트 ===");

        // 현재 유저 수 확인
        long initialCount = userRepository.count();
        System.out.println("🔍 시작 전 유저 수: " + initialCount);

        // 타임스탬프를 이용한 유니크 이메일
        long timestamp = System.currentTimeMillis();

        String[][] testUsers = {
            {"김철수", "kim" + timestamp + "@example.com"},
            {"이영희", "lee" + timestamp + "@example.com"},
            {"박민수", "park" + timestamp + "@example.com"}
        };

        for (int i = 0; i < testUsers.length; i++) {
            final int index = i;
            String name = testUsers[i][0];
            String email = testUsers[i][1];

            System.out.println("🔄 " + name + " 생성 시작...");

            String jsonRequest = String.format("""
                {
                    "email": "%s",
                    "password": "123456",
                    "nickname": "%s"
                }
                """, email, name);

            mockMvc.perform(post("/api/v1/users/signup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonRequest))
                    .andExpect(status().isCreated())
                    .andDo(result -> {
                        System.out.println("✅ " + (index + 1) + ". " + name + " 생성 완료");
                        System.out.println("응답: " + result.getResponse().getContentAsString());
                    });
        }

        // 최종 유저 수 확인
        long finalCount = userRepository.count();
        System.out.println("🔍 생성 후 유저 수: " + finalCount);
        System.out.println("📊 실제 생성된 유저 수: " + (finalCount - initialCount));

        System.out.println("=== 3명 유저 생성 테스트 완료 ===");
    }
}