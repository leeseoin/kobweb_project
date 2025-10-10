package com.kob_backend_seoin.kob_backend.step5;

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
 * 5단계: 최종 10명 유저 생성 테스트
 */
@SpringBootTest
@AutoConfigureMockMvc
public class FinalTenUsersTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void createTenUsers() throws Exception {
        System.out.println("=== 5단계: 최종 10명 유저 생성 테스트 ===");

        // 현재 유저 수 확인
        long initialCount = userRepository.count();
        System.out.println("🔍 시작 전 유저 수: " + initialCount);

        // 타임스탬프를 이용한 유니크 이메일
        long timestamp = System.currentTimeMillis();

        String[][] testUserData = {
            {"김철수", "kim" + timestamp + "@example.com"},
            {"이영희", "lee" + timestamp + "@example.com"},
            {"박민수", "park" + timestamp + "@example.com"},
            {"정수아", "jung" + timestamp + "@example.com"},
            {"최동현", "choi" + timestamp + "@example.com"},
            {"한소영", "han" + timestamp + "@example.com"},
            {"오준호", "oh" + timestamp + "@example.com"},
            {"임지현", "lim" + timestamp + "@example.com"},
            {"강태욱", "kang" + timestamp + "@example.com"},
            {"윤서연", "yoon" + timestamp + "@example.com"}
        };

        int successCount = 0;
        int failureCount = 0;

        for (int i = 0; i < testUserData.length; i++) {
            final int index = i;
            String name = testUserData[i][0];
            String email = testUserData[i][1];

            try {
                System.out.println("🔄 " + name + " (" + (index + 1) + "/10) 생성 시작...");

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
                            // JSON 응답을 간단히 파싱해서 userId만 출력
                            String response = result.getResponse().getContentAsString();
                            if (response.contains("userId")) {
                                String userId = response.substring(
                                    response.indexOf("userId\":\"") + 9,
                                    response.indexOf("\",", response.indexOf("userId"))
                                );
                                System.out.println("   사용자 ID: " + userId);
                            }
                        });

                successCount++;

            } catch (Exception e) {
                System.err.println("❌ " + name + " 생성 실패: " + e.getMessage());
                failureCount++;
            }
        }

        // 최종 결과 확인
        long finalCount = userRepository.count();
        System.out.println("\n=== 최종 결과 ===");
        System.out.println("🔍 시작 전 유저 수: " + initialCount);
        System.out.println("🔍 종료 후 유저 수: " + finalCount);
        System.out.println("📊 실제 생성된 유저 수: " + (finalCount - initialCount));
        System.out.println("✅ 성공: " + successCount + "명");
        System.out.println("❌ 실패: " + failureCount + "명");
        System.out.println("=== 10명 유저 생성 테스트 완료 ===");
    }
}