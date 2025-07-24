package com.kob_backend_seoin.kob_backend.dto.Profile;

import java.util.List;

public class ProfileUpdateRequestDto {
    private String name;
    private String jobTitle;
    private String profileImageUrl;
    private String introduction;
    private List<String> tags;
    private List<String> skills;
    private List<ProfileResponseDto.ExperienceDto> experience;
    private List<ProfileResponseDto.EducationDto> education;

    public ProfileUpdateRequestDto() {}

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
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public List<ProfileResponseDto.ExperienceDto> getExperience() { return experience; }
    public void setExperience(List<ProfileResponseDto.ExperienceDto> experience) { this.experience = experience; }
    public List<ProfileResponseDto.EducationDto> getEducation() { return education; }
    public void setEducation(List<ProfileResponseDto.EducationDto> education) { this.education = education; }
} 