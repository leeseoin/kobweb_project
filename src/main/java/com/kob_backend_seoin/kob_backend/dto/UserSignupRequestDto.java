package com.kob_backend_seoin.kob_backend.dto;

public class UserSignupRequestDto {
    private String email;
    private String password;
    private String nickname;

    public UserSignupRequestDto() {}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
} 