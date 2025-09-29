package com.kob_backend_seoin.kob_backend.dto.Resume;

import java.time.LocalDateTime;
import java.util.List;

public class ResumeResponseDto {
    private String resumeId;
    private String userId;
    private String title;
    private String introduction;
    private List<ExperienceDto> experience;
    private List<EducationDto> education;
    private List<String> skills;
    private List<ProjectDto> projects;
    private List<String> links;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 경력 사항 DTO
    public static class ExperienceDto {
        private String companyName;
        private String position;
        private String period;
        private String description;

        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public String getPosition() { return position; }
        public void setPosition(String position) { this.position = position; }
        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    // 학력 사항 DTO
    public static class EducationDto {
        private String schoolName;
        private String major;
        private String degree;
        private String period;
        private String description;

        public String getSchoolName() { return schoolName; }
        public void setSchoolName(String schoolName) { this.schoolName = schoolName; }
        public String getMajor() { return major; }
        public void setMajor(String major) { this.major = major; }
        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }
        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    // 프로젝트 경험 DTO
    public static class ProjectDto {
        private String projectName;
        private String period;
        private String description;
        private String role;
        private List<String> techStack;
        private String projectUrl;

        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public List<String> getTechStack() { return techStack; }
        public void setTechStack(List<String> techStack) { this.techStack = techStack; }
        public String getProjectUrl() { return projectUrl; }
        public void setProjectUrl(String projectUrl) { this.projectUrl = projectUrl; }
    }

    // getter/setter
    public String getResumeId() { return resumeId; }
    public void setResumeId(String resumeId) { this.resumeId = resumeId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getIntroduction() { return introduction; }
    public void setIntroduction(String introduction) { this.introduction = introduction; }
    public List<ExperienceDto> getExperience() { return experience; }
    public void setExperience(List<ExperienceDto> experience) { this.experience = experience; }
    public List<EducationDto> getEducation() { return education; }
    public void setEducation(List<EducationDto> education) { this.education = education; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public List<ProjectDto> getProjects() { return projects; }
    public void setProjects(List<ProjectDto> projects) { this.projects = projects; }
    public List<String> getLinks() { return links; }
    public void setLinks(List<String> links) { this.links = links; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
} 