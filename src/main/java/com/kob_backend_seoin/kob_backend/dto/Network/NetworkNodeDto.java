package com.kob_backend_seoin.kob_backend.dto.Network;

import java.util.List;

public class NetworkNodeDto {
    private String userId;
    private String name;
    private String email;
    private String company;
    private String position;
    private List<String> skills;
    private int connectionLevel;

    public NetworkNodeDto() {}

    public NetworkNodeDto(String userId, String name, String email, String company, String position, List<String> skills, int connectionLevel) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.company = company;
        this.position = position;
        this.skills = skills;
        this.connectionLevel = connectionLevel;
    }

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

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public int getConnectionLevel() { return connectionLevel; }
    public void setConnectionLevel(int connectionLevel) { this.connectionLevel = connectionLevel; }
}