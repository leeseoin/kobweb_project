package com.kob_backend_seoin.kob_backend.dto.User;

public class UserLoginRequestDto {
    private String email;
    private String password;

    public UserLoginRequestDto() {}

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
} 