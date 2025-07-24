package com.kob_backend_seoin.kob_backend.dto.Profile;

import java.util.List;

public class ProfileResponseDto {
    private String userId;
    private String name;
    private String jobTitle;
    private String profileImageUrl;
    private String introduction;
    private List<String> tags;
    private List<ExperienceDto> experience;
    private List<EducationDto> education;
    private List<String> skills;

    public static class ExperienceDto {
        private String companyName;
        private String position;
        private String period;
        public ExperienceDto() {}
        public ExperienceDto(String companyName, String position, String period) {
            this.companyName = companyName;
            this.position = position;
            this.period = period;
        }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public String getPosition() { return position; }
        public void setPosition(String position) { this.position = position; }
        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
    }
    public static class EducationDto {
        private String schoolName;
        private String degree;
        private String period;
        public EducationDto() {}
        public EducationDto(String schoolName, String degree, String period) {
            this.schoolName = schoolName;
            this.degree = degree;
            this.period = period;
        }
        public String getSchoolName() { return schoolName; }
        public void setSchoolName(String schoolName) { this.schoolName = schoolName; }
        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }
        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
    }

    public ProfileResponseDto() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    public String getIntroduction() { return introduction; }
    public void setIntroduction(String introduction) { this.introduction = introduction; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public List<ExperienceDto> getExperience() { return experience; }
    public void setExperience(List<ExperienceDto> experience) { this.experience = experience; }
    public List<EducationDto> getEducation() { return education; }
    public void setEducation(List<EducationDto> education) { this.education = education; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
} 