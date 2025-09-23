package com.kob_backend_seoin.kob_backend.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true) // OAuth 로그인 시 비밀번호가 없을 수 있음
    private String password;

    @Column(nullable = false)
    private String nickname;

    @Column(name = "provider")
    private String provider; // google, github, local

    @Column(name = "provider_id")
    private String providerId; // OAuth 제공자의 사용자 ID

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 기본 생성자
    public User() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // 로컬 회원가입용 생성자
    public User(String email, String password, String nickname) {
        this();
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.provider = "local";
    }

    // OAuth 회원가입용 생성자
    public User(String email, String nickname, String provider, String providerId, String profileImageUrl) {
        this();
        this.email = email;
        this.nickname = nickname;
        this.provider = provider;
        this.providerId = providerId;
        this.profileImageUrl = profileImageUrl;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getNickname() { return nickname; }
    public String getProvider() { return provider; }
    public String getProviderId() { return providerId; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(UUID id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public void setProvider(String provider) { this.provider = provider; }
    public void setProviderId(String providerId) { this.providerId = providerId; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
} 