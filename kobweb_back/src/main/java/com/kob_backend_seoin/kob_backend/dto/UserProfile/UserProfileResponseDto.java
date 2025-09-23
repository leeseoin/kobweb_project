package com.kob_backend_seoin.kob_backend.dto.UserProfile;

import java.time.LocalDateTime;
import java.util.List;

public class UserProfileResponseDto {
    private String profileId;
    private String userId;
    private String name;
    private String email;
    private String company;
    private String position;
    private String bio;
    private String profileImageUrl;
    private String location;
    private String phone;
    private String github;
    private String notion;
    private List<String> skills;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserProfileResponseDto() {}

    // Getters and Setters
    public String getProfileId() { return profileId; }
    public void setProfileId(String profileId) { this.profileId = profileId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGithub() { return github; }
    public void setGithub(String github) { this.github = github; }

    public String getNotion() { return notion; }
    public void setNotion(String notion) { this.notion = notion; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}