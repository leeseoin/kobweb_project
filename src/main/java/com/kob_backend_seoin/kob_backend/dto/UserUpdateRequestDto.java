package com.kob_backend_seoin.kob_backend.dto;

public class UserUpdateRequestDto {
    private String nickname;

    public UserUpdateRequestDto() {}

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
} 