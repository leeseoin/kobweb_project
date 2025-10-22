package com.kob_backend_seoin.kob_backend.dto.Network;

public class NetworkStatsDto {
    private int totalConnections;
    private int directFriends;
    private int mutualConnections;

    public NetworkStatsDto() {}

    public NetworkStatsDto(int totalConnections, int directFriends, int mutualConnections) {
        this.totalConnections = totalConnections;
        this.directFriends = directFriends;
        this.mutualConnections = mutualConnections;
    }

    public int getTotalConnections() { return totalConnections; }
    public void setTotalConnections(int totalConnections) { this.totalConnections = totalConnections; }

    public int getDirectFriends() { return directFriends; }
    public void setDirectFriends(int directFriends) { this.directFriends = directFriends; }

    public int getMutualConnections() { return mutualConnections; }
    public void setMutualConnections(int mutualConnections) { this.mutualConnections = mutualConnections; }
}