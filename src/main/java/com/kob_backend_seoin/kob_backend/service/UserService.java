package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.domain.User;
import com.kob_backend_seoin.kob_backend.dto.UserSignupRequestDto;
import com.kob_backend_seoin.kob_backend.dto.UserSignupResponseDto;
import com.kob_backend_seoin.kob_backend.dto.UserUpdateRequestDto;
import com.kob_backend_seoin.kob_backend.dto.UserResponseDto;
import com.kob_backend_seoin.kob_backend.dto.UserLoginRequestDto;
import com.kob_backend_seoin.kob_backend.dto.UserLoginResponseDto;
import com.kob_backend_seoin.kob_backend.repository.UserRepository;
import com.kob_backend_seoin.kob_backend.exception.CustomException;
import com.kob_backend_seoin.kob_backend.exception.ErrorCode;
import com.kob_backend_seoin.kob_backend.service.JwtProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Autowired
    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }

    public UserSignupResponseDto signup(UserSignupRequestDto requestDto) {
        if (userRepository.findByEmail(requestDto.getEmail()).isPresent()) {
            throw new CustomException("이미 사용 중인 이메일입니다.", ErrorCode.ALREADY_EXISTS);
        }
        String encodedPassword = passwordEncoder.encode(requestDto.getPassword());
        User user = new User(requestDto.getEmail(), encodedPassword, requestDto.getNickname());
        User savedUser = userRepository.save(user);
        return new UserSignupResponseDto(
                savedUser.getId().toString(),
                savedUser.getEmail(),
                savedUser.getNickname()
        );
    }

    public UserLoginResponseDto login(UserLoginRequestDto requestDto) {
        User user = userRepository.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new CustomException("이메일 또는 비밀번호가 올바르지 않습니다.", ErrorCode.UNAUTHORIZED));
        if (!passwordEncoder.matches(requestDto.getPassword(), user.getPassword())) {
            throw new CustomException("이메일 또는 비밀번호가 올바르지 않습니다.", ErrorCode.UNAUTHORIZED);
        }
        String accessToken = jwtProvider.createAccessToken(user.getId().toString(), user.getEmail());
        String refreshToken = jwtProvider.createRefreshToken(user.getId().toString());
        return new UserLoginResponseDto(accessToken, refreshToken);
    }

    // 사용자 조회 (전체)
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserResponseDto(
                        user.getId().toString(),
                        user.getEmail(),
                        user.getNickname()
                ))
                .collect(Collectors.toList());
    }

    // 사용자 조회 (단일)
    public UserResponseDto getUserById(String userId) {
        UUID id = UUID.fromString(userId);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        return new UserResponseDto(
                user.getId().toString(),
                user.getEmail(),
                user.getNickname()
        );
    }

    // 사용자 수정
    public UserResponseDto updateUser(String userId, UserUpdateRequestDto requestDto) {
        UUID id = UUID.fromString(userId);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        user.setNickname(requestDto.getNickname());
        User updatedUser = userRepository.save(user);
        
        return new UserResponseDto(
                updatedUser.getId().toString(),
                updatedUser.getEmail(),
                updatedUser.getNickname()
        );
    }

    // 사용자 삭제
    public void deleteUser(String userId) {
        UUID id = UUID.fromString(userId);
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }
        userRepository.deleteById(id);
    }
} 