package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.domain.Resume;
import com.kob_backend_seoin.kob_backend.domain.ResumeExperience;
import com.kob_backend_seoin.kob_backend.domain.ResumeEducation;
import com.kob_backend_seoin.kob_backend.domain.ResumeProject;
import com.kob_backend_seoin.kob_backend.dto.Resume.ResumeRequestDto;
import com.kob_backend_seoin.kob_backend.dto.Resume.ResumeResponseDto;
import com.kob_backend_seoin.kob_backend.exception.CustomException;
import com.kob_backend_seoin.kob_backend.exception.ErrorCode;
import com.kob_backend_seoin.kob_backend.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ResumeService {
    private final ResumeRepository resumeRepository;

    @Autowired
    public ResumeService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    // 이력서 등록
    @Transactional
    public ResumeResponseDto createResume(UUID userId, ResumeRequestDto dto) {
        Resume resume = new Resume();
        resume.setUserId(userId);
        resume.setTitle(dto.getTitle());
        resume.setIntroduction(dto.getIntroduction());
        resume.setSkills(dto.getSkills());
        resume.setLinks(dto.getLinks());

        // 경력 사항 변환
        if (dto.getExperience() != null) {
            List<ResumeExperience> experiences = dto.getExperience().stream().map(e -> {
                ResumeExperience exp = new ResumeExperience();
                exp.setCompanyName(e.getCompanyName());
                exp.setPosition(e.getPosition());
                exp.setPeriod(e.getPeriod());
                exp.setDescription(e.getDescription());
                exp.setResume(resume);
                return exp;
            }).collect(Collectors.toList());
            resume.setExperience(experiences);
        }

        // 학력 사항 변환
        if (dto.getEducation() != null) {
            List<ResumeEducation> educations = dto.getEducation().stream().map(e -> {
                ResumeEducation edu = new ResumeEducation();
                edu.setSchoolName(e.getSchoolName());
                edu.setMajor(e.getMajor());
                edu.setDegree(e.getDegree());
                edu.setPeriod(e.getPeriod());
                edu.setDescription(e.getDescription());
                edu.setResume(resume);
                return edu;
            }).collect(Collectors.toList());
            resume.setEducation(educations);
        }

        // 프로젝트 경험 변환
        if (dto.getProjects() != null) {
            List<ResumeProject> projects = dto.getProjects().stream().map(p -> {
                ResumeProject proj = new ResumeProject();
                proj.setProjectName(p.getProjectName());
                proj.setPeriod(p.getPeriod());
                proj.setDescription(p.getDescription());
                proj.setRole(p.getRole());
                proj.setTechStack(p.getTechStack());
                proj.setProjectUrl(p.getProjectUrl());
                proj.setResume(resume);
                return proj;
            }).collect(Collectors.toList());
            resume.setProjects(projects);
        }

        Resume saved = resumeRepository.save(resume);
        return toDto(saved);
    }

    // 이력서 수정
    @Transactional
    public ResumeResponseDto updateResume(UUID userId, UUID resumeId, ResumeRequestDto dto) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new CustomException("이력서를 찾을 수 없습니다.", ErrorCode.NOT_FOUND));

        if (!resume.getUserId().equals(userId)) {
            throw new CustomException("권한이 없습니다.", ErrorCode.FORBIDDEN);
        }

        // 기본 정보 업데이트
        if (dto.getTitle() != null) resume.setTitle(dto.getTitle());
        if (dto.getIntroduction() != null) resume.setIntroduction(dto.getIntroduction());
        if (dto.getSkills() != null) resume.setSkills(dto.getSkills());
        if (dto.getLinks() != null) resume.setLinks(dto.getLinks());

        // 경력 사항 업데이트
        if (dto.getExperience() != null) {
            resume.getExperience().clear();
            List<ResumeExperience> experiences = dto.getExperience().stream().map(e -> {
                ResumeExperience exp = new ResumeExperience();
                exp.setCompanyName(e.getCompanyName());
                exp.setPosition(e.getPosition());
                exp.setPeriod(e.getPeriod());
                exp.setDescription(e.getDescription());
                exp.setResume(resume);
                return exp;
            }).collect(Collectors.toList());
            resume.setExperience(experiences);
        }

        // 학력 사항 업데이트
        if (dto.getEducation() != null) {
            resume.getEducation().clear();
            List<ResumeEducation> educations = dto.getEducation().stream().map(e -> {
                ResumeEducation edu = new ResumeEducation();
                edu.setSchoolName(e.getSchoolName());
                edu.setMajor(e.getMajor());
                edu.setDegree(e.getDegree());
                edu.setPeriod(e.getPeriod());
                edu.setDescription(e.getDescription());
                edu.setResume(resume);
                return edu;
            }).collect(Collectors.toList());
            resume.setEducation(educations);
        }

        // 프로젝트 경험 업데이트
        if (dto.getProjects() != null) {
            resume.getProjects().clear();
            List<ResumeProject> projects = dto.getProjects().stream().map(p -> {
                ResumeProject proj = new ResumeProject();
                proj.setProjectName(p.getProjectName());
                proj.setPeriod(p.getPeriod());
                proj.setDescription(p.getDescription());
                proj.setRole(p.getRole());
                proj.setTechStack(p.getTechStack());
                proj.setProjectUrl(p.getProjectUrl());
                proj.setResume(resume);
                return proj;
            }).collect(Collectors.toList());
            resume.setProjects(projects);
        }

        Resume updated = resumeRepository.save(resume);
        return toDto(updated);
    }

    // 이력서 삭제
    @Transactional
    public void deleteResume(UUID userId, UUID resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new CustomException("이력서를 찾을 수 없습니다.", ErrorCode.NOT_FOUND));

        if (!resume.getUserId().equals(userId)) {
            throw new CustomException("권한이 없습니다.", ErrorCode.FORBIDDEN);
        }

        resumeRepository.delete(resume);
    }

    // 이력서 조회
    public ResumeResponseDto getResume(UUID userId, UUID resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new CustomException("이력서를 찾을 수 없습니다.", ErrorCode.NOT_FOUND));

        if (!resume.getUserId().equals(userId)) {
            throw new CustomException("권한이 없습니다.", ErrorCode.FORBIDDEN);
        }

        return toDto(resume);
    }

    // Entity → DTO 변환
    private ResumeResponseDto toDto(Resume resume) {
        ResumeResponseDto dto = new ResumeResponseDto();
        dto.setResumeId(resume.getResumeId().toString());
        dto.setUserId(resume.getUserId().toString());
        dto.setTitle(resume.getTitle());
        dto.setIntroduction(resume.getIntroduction());
        dto.setSkills(resume.getSkills());
        dto.setLinks(resume.getLinks());
        dto.setCreatedAt(resume.getCreatedAt());
        dto.setUpdatedAt(resume.getUpdatedAt());

        // 경력 사항 변환
        if (resume.getExperience() != null) {
            dto.setExperience(resume.getExperience().stream().map(e -> {
                ResumeResponseDto.ExperienceDto expDto = new ResumeResponseDto.ExperienceDto();
                expDto.setCompanyName(e.getCompanyName());
                expDto.setPosition(e.getPosition());
                expDto.setPeriod(e.getPeriod());
                expDto.setDescription(e.getDescription());
                return expDto;
            }).collect(Collectors.toList()));
        }

        // 학력 사항 변환
        if (resume.getEducation() != null) {
            dto.setEducation(resume.getEducation().stream().map(e -> {
                ResumeResponseDto.EducationDto eduDto = new ResumeResponseDto.EducationDto();
                eduDto.setSchoolName(e.getSchoolName());
                eduDto.setMajor(e.getMajor());
                eduDto.setDegree(e.getDegree());
                eduDto.setPeriod(e.getPeriod());
                eduDto.setDescription(e.getDescription());
                return eduDto;
            }).collect(Collectors.toList()));
        }

        // 프로젝트 경험 변환
        if (resume.getProjects() != null) {
            dto.setProjects(resume.getProjects().stream().map(p -> {
                ResumeResponseDto.ProjectDto projDto = new ResumeResponseDto.ProjectDto();
                projDto.setProjectName(p.getProjectName());
                projDto.setPeriod(p.getPeriod());
                projDto.setDescription(p.getDescription());
                projDto.setRole(p.getRole());
                projDto.setTechStack(p.getTechStack());
                projDto.setProjectUrl(p.getProjectUrl());
                return projDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
