package com.kob_backend_seoin.kob_backend;

import com.kob_backend_seoin.kob_backend.domain.User;
import com.kob_backend_seoin.kob_backend.domain.BusinessCard;
import com.kob_backend_seoin.kob_backend.dto.BusinessCard.BusinessCardRequestDto;
import com.kob_backend_seoin.kob_backend.repository.UserRepository;
import com.kob_backend_seoin.kob_backend.repository.BusinessCardRepository;
import com.kob_backend_seoin.kob_backend.service.BusinessCardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@SpringBootTest
@AutoConfigureMockMvc
public class TestDataGenerator {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessCardService businessCardService;

    @Autowired
    private BusinessCardRepository businessCardRepository;

    @Autowired
    private MockMvc mockMvc;

    // 회원가입 API를 통한 테스트 유저 10명 생성
    @Test
    public void createTestUsersViaAPI() throws Exception {
        System.out.println("=== API 호출로 테스트 유저 10명 생성 시작 ===");

        // 현재 테이블 상태 확인
        long initialCount = userRepository.count();
        System.out.println("🔍 시작 전 유저 수: " + initialCount);

        // 유니크한 이메일을 위해 타임스탬프 추가
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

        for (int i = 0; i < testUserData.length; i++) {
            final int index = i; // final 변수로 만들기
            String name = testUserData[i][0];
            String email = testUserData[i][1];

            try {
                System.out.println("🔄 " + name + " API 호출 시작...");

                // 회원가입 API 호출
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
                            System.out.println("✅ " + (index + 1) + ". API 응답: " + result.getResponse().getContentAsString());
                        });

                System.out.println("✅ " + (index + 1) + ". 유저 생성: " + name + " (" + email + ")");

            } catch (Exception e) {
                System.err.println("❌ 유저 " + name + " API 호출 중 오류: " + e.getMessage());
                e.printStackTrace();
            }
        }

        // 최종 확인
        long finalCount = userRepository.count();
        System.out.println("🔍 생성 후 유저 수: " + finalCount);
        System.out.println("📊 실제 생성된 유저 수: " + (finalCount - initialCount));

        System.out.println("=== API 호출로 테스트 유저 생성 완료 ===");
    }

    // 전체 유저 목록 리스트 업 테스트
    @Test
    public void printAllUsers() {
        System.out.println("=== 전체 유저 목록 ===");
        List<User> users = userRepository.findAll();
        for (User user : users) {
            System.out.println("ID: " + user.getId() +
                             ", Nickname: " + user.getNickname() +
                             ", Email: " + user.getEmail());
        }
        System.out.println("총 " + users.size() + "명의 유저가 있습니다.");
    }
}