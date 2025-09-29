package com.kob_backend_seoin.kob_backend.dto.Contact;

import com.kob_backend_seoin.kob_backend.domain.Contact;
import java.time.LocalDateTime;
import java.util.List;

public class ContactResponseDto {
    private String contactId;
    private String ownerId;
    private String targetUserId;  // 플랫폼 사용자 ID (nullable)
    private String name;
    private String email;
    private String company;
    private String position;
    private String phone;
    private String location;
    private String github;
    private String notion;
    private String notes;
    private List<String> skills;
    private Contact.ContactSource source;
    private boolean isPlatformUser;  // 플랫폼 사용자 여부
    private LocalDateTime lastContactedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ContactResponseDto() {}

    // Getters and Setters
    public String getContactId() { return contactId; }
    public void setContactId(String contactId) { this.contactId = contactId; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public String getTargetUserId() { return targetUserId; }
    public void setTargetUserId(String targetUserId) { this.targetUserId = targetUserId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getGithub() { return github; }
    public void setGithub(String github) { this.github = github; }

    public String getNotion() { return notion; }
    public void setNotion(String notion) { this.notion = notion; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public Contact.ContactSource getSource() { return source; }
    public void setSource(Contact.ContactSource source) { this.source = source; }

    public boolean isPlatformUser() { return isPlatformUser; }
    public void setPlatformUser(boolean platformUser) { isPlatformUser = platformUser; }

    public LocalDateTime getLastContactedAt() { return lastContactedAt; }
    public void setLastContactedAt(LocalDateTime lastContactedAt) { this.lastContactedAt = lastContactedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}