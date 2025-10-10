package com.kob_backend_seoin.kob_backend.dto.BusinessCard;

import java.time.LocalDateTime;
import java.util.List;

public class BusinessCardResponseDto {
    private String businessCardId;
    private String name;
    private String email;
    private String company;
    private String position;
    private List<String> skills;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BusinessCardResponseDto() {}

    public String getBusinessCardId() { return businessCardId; }
    public void setBusinessCardId(String businessCardId) { this.businessCardId = businessCardId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
} 