package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.domain.Profile;
import com.kob_backend_seoin.kob_backend.domain.Experience;
import com.kob_backend_seoin.kob_backend.domain.Education;
import com.kob_backend_seoin.kob_backend.dto.Profile.ProfileUpdateRequestDto;
import com.kob_backend_seoin.kob_backend.dto.Profile.ProfileResponseDto;
import com.kob_backend_seoin.kob_backend.exception.CustomException;
import com.kob_backend_seoin.kob_backend.exception.ErrorCode;
import com.kob_backend_seoin.kob_backend.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProfileService {
    private final ProfileRepository profileRepository;

    @Autowired
    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public ProfileResponseDto getProfileByUserId(String userId) {
        Profile profile = profileRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new CustomException("프로필을 찾을 수 없습니다.", ErrorCode.NOT_FOUND));
        return toDto(profile);
    }

    public ProfileResponseDto updateMyProfile(String userId, ProfileUpdateRequestDto dto) {
        Profile profile = profileRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new CustomException("프로필을 찾을 수 없습니다.", ErrorCode.NOT_FOUND));
        if (dto.getName() != null) profile.setName(dto.getName());
        if (dto.getJobTitle() != null) profile.setJobTitle(dto.getJobTitle());
        if (dto.getProfileImageUrl() != null) profile.setProfileImageUrl(dto.getProfileImageUrl());
        if (dto.getIntroduction() != null) profile.setIntroduction(dto.getIntroduction());
        if (dto.getTags() != null) profile.setTags(dto.getTags());
        if (dto.getSkills() != null) profile.setSkills(dto.getSkills());
        if (dto.getExperience() != null) {
            List<Experience> experiences = dto.getExperience().stream().map(e -> {
                Experience exp = new Experience();
                exp.setCompanyName(e.getCompanyName());
                exp.setPosition(e.getPosition());
                exp.setPeriod(e.getPeriod());
                exp.setProfile(profile);
                return exp;
            }).collect(Collectors.toList());
            profile.setExperience(experiences);
        }
        if (dto.getEducation() != null) {
            List<Education> educations = dto.getEducation().stream().map(e -> {
                Education edu = new Education();
                edu.setSchoolName(e.getSchoolName());
                edu.setDegree(e.getDegree());
                edu.setPeriod(e.getPeriod());
                edu.setProfile(profile);
                return edu;
            }).collect(Collectors.toList());
            profile.setEducation(educations);
        }
        Profile saved = profileRepository.save(profile);
        return toDto(saved);
    }

    public Page<ProfileResponseDto> getResumeList(int page, int size, String query) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Profile> profiles;
        if (query != null && !query.isBlank()) {
            List<Profile> filtered = profileRepository.findAll(pageable).stream().filter(p -> {
                boolean match = (p.getName() != null && p.getName().contains(query)) ||
                        (p.getJobTitle() != null && p.getJobTitle().contains(query)) ||
                        (p.getSkills() != null && p.getSkills().stream().anyMatch(s -> s.contains(query)));
                return match;
            }).collect(Collectors.toList());
            profiles = new PageImpl<>(filtered, pageable, filtered.size());
        } else {
            profiles = profileRepository.findAll(pageable);
        }
        return profiles.map(this::toDto);
    }

    private ProfileResponseDto toDto(Profile profile) {
        ProfileResponseDto dto = new ProfileResponseDto();
        dto.setUserId(profile.getUserId().toString());
        dto.setName(profile.getName());
        dto.setJobTitle(profile.getJobTitle());
        dto.setProfileImageUrl(profile.getProfileImageUrl());
        dto.setIntroduction(profile.getIntroduction());
        dto.setTags(profile.getTags());
        dto.setSkills(profile.getSkills());
        if (profile.getExperience() != null) {
            dto.setExperience(profile.getExperience().stream().map(e ->
                    new ProfileResponseDto.ExperienceDto(e.getCompanyName(), e.getPosition(), e.getPeriod())
            ).collect(Collectors.toList()));
        }
        if (profile.getEducation() != null) {
            dto.setEducation(profile.getEducation().stream().map(e ->
                    new ProfileResponseDto.EducationDto(e.getSchoolName(), e.getDegree(), e.getPeriod())
            ).collect(Collectors.toList()));
        }
        return dto;
    }
} 