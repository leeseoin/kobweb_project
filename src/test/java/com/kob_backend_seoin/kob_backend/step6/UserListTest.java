package com.kob_backend_seoin.kob_backend.step6;

import com.kob_backend_seoin.kob_backend.domain.User;
import com.kob_backend_seoin.kob_backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

/**
 * 6단계: 생성된 유저 목록 조회 테스트
 */
@SpringBootTest
public class UserListTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void printAllUsers() {
        System.out.println("=== 6단계: 전체 유저 목록 조회 ===");

        List<User> users = userRepository.findAll();
        System.out.println("총 " + users.size() + "명의 유저가 있습니다.\n");

        if (users.isEmpty()) {
            System.out.println("등록된 유저가 없습니다.");
        } else {
            System.out.println("📋 유저 목록:");
            System.out.println("┌─────┬─────────────────────────────────────────┬──────────────────────────┬──────────────┐");
            System.out.println("│ No  │                 User ID                 │          Email           │   Nickname   │");
            System.out.println("├─────┼─────────────────────────────────────────┼──────────────────────────┼──────────────┤");

            for (int i = 0; i < users.size(); i++) {
                User user = users.get(i);
                String userIdShort = user.getId().toString().substring(0, 8) + "...";
                System.out.printf("│ %3d │ %-39s │ %-24s │ %-12s │%n",
                    i + 1,
                    userIdShort,
                    user.getEmail().length() > 24 ? user.getEmail().substring(0, 21) + "..." : user.getEmail(),
                    user.getNickname().length() > 12 ? user.getNickname().substring(0, 9) + "..." : user.getNickname()
                );
            }

            System.out.println("└─────┴─────────────────────────────────────────┴──────────────────────────┴──────────────┘");
        }

        System.out.println("\n=== 유저 목록 조회 완료 ===");
    }

    @Test
    public void findRecentUsers() {
        System.out.println("=== 최근 생성된 유저 5명 조회 ===");

        List<User> allUsers = userRepository.findAll();

        if (allUsers.size() >= 5) {
            List<User> recentUsers = allUsers.subList(allUsers.size() - 5, allUsers.size());

            System.out.println("📋 최근 생성된 5명:");
            for (int i = 0; i < recentUsers.size(); i++) {
                User user = recentUsers.get(i);
                System.out.println((i + 1) + ". " + user.getNickname() + " (" + user.getEmail() + ")");
            }
        } else {
            System.out.println("전체 유저가 5명 미만입니다. 전체 " + allUsers.size() + "명");
        }

        System.out.println("=== 최근 유저 조회 완료 ===");
    }
}