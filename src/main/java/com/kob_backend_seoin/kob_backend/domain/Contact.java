package com.kob_backend_seoin.kob_backend.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "contacts")
public class Contact {
    @Id
    @GeneratedValue
    private UUID contactId;

    @Column(nullable = false)
    private UUID ownerId;  // 연락처를 소유한 사용자 ID

    private UUID targetUserId;  // 실제 플랫폼 사용자 ID (nullable)

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private String company;
    private String position;
    private String phone;
    private String location;
    private String github;
    private String notion;
    private String notes;  // 개인 메모

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "contact_skills", joinColumns = @JoinColumn(name = "contact_id"))
    @Column(name = "skill")
    private List<String> skills;

    @Enumerated(EnumType.STRING)
    private ContactSource source = ContactSource.MANUAL;

    private LocalDateTime lastContactedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // 연락처 출처
    public enum ContactSource {
        MANUAL,        // 수동 추가
        BUSINESS_CARD, // 명함 교환
        IMPORTED,      // 외부 가져오기
        PLATFORM       // 플랫폼 내 사용자
    }

    // 기본 생성자
    public Contact() {}

    // 생성자
    public Contact(UUID ownerId, String name, String email) {
        this.ownerId = ownerId;
        this.name = name;
        this.email = email;
    }

    // 플랫폼 사용자인지 확인
    public boolean isPlatformUser() {
        return targetUserId != null;
    }

    // 마지막 연락 시간 업데이트
    public void updateLastContactedAt() {
        this.lastContactedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getContactId() { return contactId; }
    public void setContactId(UUID contactId) { this.contactId = contactId; }

    public UUID getOwnerId() { return ownerId; }
    public void setOwnerId(UUID ownerId) { this.ownerId = ownerId; }

    public UUID getTargetUserId() { return targetUserId; }
    public void setTargetUserId(UUID targetUserId) { this.targetUserId = targetUserId; }

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

    public ContactSource getSource() { return source; }
    public void setSource(ContactSource source) { this.source = source; }

    public LocalDateTime getLastContactedAt() { return lastContactedAt; }
    public void setLastContactedAt(LocalDateTime lastContactedAt) { this.lastContactedAt = lastContactedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}